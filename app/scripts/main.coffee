# Controller
class GameController
	constructor: ->
		# Game data
		@board = window.gamedata
		@players = []
		@lastUpdate = Date.now()
		@state = 'playerOptions'
		@currentPlayer = null
		@boardOpenForPlayers = false

		# Save state every secound
		@saveStateInternal = setInterval =>
			@lastUpdate = Date.now()
			@saveState()
		, 250

		# Load state
		@loadState()

		# Sounds
		soundList =
			dailydouble: url: '/sounds/dailydouble.mp3', volume: 100
			buzzer: url: '/sounds/buzzer.mp3', volume: 100
			waiting: url: '/sounds/waiting.mp3', volume: 25

		# Init soundManager
		soundManager.setup
			url: '/soundmanager2/swf/'
			preferFlash: false
			onready: =>
				for key, value of soundList
					soundManager.createSound id: key, url: value.url, volume: value.volume

		# Full screen
		Mousetrap.bind 'f', -> $('body').get(0).mozRequestFullScreen()

	saveState: =>
		state = JSON.stringify @, (key, value)->
			return undefined if key in ['sound', '_s', '_a']
			return value

		localStorage.setItem @board.id, state

	loadState: =>
		# Load old state
		oldState = JSON.parse localStorage.getItem(@board.id)
		for key, value of oldState
			@[key] = value

		# Current player
		@players.forEach (player)=> @currentPlayer = player if player.isCurrentPlayer

		# Init game with player options
		if @state is 'playerOptions'
			# Add first player
			@addPlayer() unless @players.length > 0

			# Init buzzer test
			for player in @players
				@testBuzzer player unless player.keyWorking

			# Show player options on start up
			$('#playerOptions').modal 'show'

		# Init game with game board
		if @state.startsWith 'gaming'
			@startGame()

			# Open question?
			if @state is 'gaming:openQuestion'
				@showQuestion {},
					value: @currentQuestion.value
					category: @currentQuestion.category

	categories: =>
		Object.keys @board.categories

	categoriesColumnWidth: =>
		( 100 / @categories().length ) + "%"

	playersColumnsWidth: =>
		( 100 / @players.length ) + "%"

	enableOrDisablePlayerInput: (boardOpenForPlayers = !@boardOpenForPlayers)=>
		@boardOpenForPlayers = boardOpenForPlayers

	openQuestionsLeft: =>
		@questionCount = 0
		@questionAnswerdCount = 0

		for category, questions of @board.categories
			for question in questions
				@questionCount++
				@questionAnswerdCount++ if question.answered

		@questionAnswerdCount isnt @questionCount

	playerBuzzes: (event)=>
		# Find out player
		player = @players[event.keyCode-49]

		# Disable buzzers unless board is open for players
		return false unless @boardOpenForPlayers

		# Only the currentPlayer is allowed
		if @currentPlayer isnt null
			return false unless @currentPlayer is player
		else
			@players.forEach (element)-> element.isCurrentPlayer = false
			@currentPlayer = null
			@currentPlayer = player
			@currentPlayer.isCurrentPlayer = true
			@enableOrDisablePlayerInput()
			soundManager.play 'buzzer'

	startGame: (event)=>
		# Prevent submitting
		event.preventDefault() if event?

		# Set game state
		@state = 'gaming' if @state is 'playerOptions'

		# Hide the player options modal
		$('#playerOptions').modal 'hide'

		# Allow moderator to open/close board for players
		Mousetrap.bind 't', => @enableOrDisablePlayerInput()

		# Select random user
		Mousetrap.bind 'r', =>
			# Randomize player array
			players = @players.slice()
			i = players.length
			while --i
				j = Math.floor( Math.random() * ( i + 1 ) )
				[players[i], players[j]] = [players[j], players[i]]

			# Remove currentPlayer
			@players.forEach (element)-> element.isCurrentPlayer = false

			# See: https://github.com/mikeric/rivets/issues/452
			@currentPlayer = null
			@currentPlayer = players[0]
			@currentPlayer.isCurrentPlayer = true

		# Remove current player
		Mousetrap.bind 'shift+r', =>
			@currentPlayer.isCurrentPlayer = false if @currentPlayer
			@currentPlayer = null

		# Show final screen
		Mousetrap.bind 's', =>
			@showFinalScreen() unless @currentQuestion

		# Listen for player buzzers
		keys = []
		for player in @players
			keys.push "shift+#{player.key}"
		Mousetrap.bind keys, @playerBuzzes

	restart: =>
		clearInterval @saveStateInternal
		localStorage.removeItem @board.id
		window.location.reload()

	addPlayer: =>
		# New player key
		newPlayerKey = if @players.length > 0 then @players[@players.length-1].key + 1 else 1

		# Add to players list
		@players.push player =
			key: newPlayerKey
			name: "Player #{newPlayerKey}"
			value: 0
			keyWorking: false
			color: randomColor luminosity: 'bright'
			isCurrentPlayer: false

		# Update buttons
		@lastUpdate = Date.now()

		# Enable buzzer test
		@testBuzzer player

	testBuzzer: (player)=>
		# Listen for buzzer
		Mousetrap.bind "shift+#{player.key}", =>
			player.keyWorking = true
			@lastUpdate = Date.now()
			Mousetrap.unbind "shift+#{player.key}"
			soundManager.play 'buzzer'

	deletePlayer: (event, data)=>
		@players.splice data.index, 1

	allPlayersReady: =>
		notReadyPlayers = $.grep @players, (e)-> e.keyWorking is false
		notReadyPlayers.length is 0

	questionStatus: ->
		questionIndex = @board.values.indexOf parseInt(@value)
		question = @board.categories[@category][questionIndex]
		question.answered

	questionColor: ->
		questionIndex = @board.values.indexOf parseInt(@value)
		question = @board.categories[@category][questionIndex]

		if question.answered and question.answeredBy?
			return question.answeredBy.color
		else
			return 'transparent'

	showQuestion: (event, data)=>
		# Set game state
		@state = 'gaming:openQuestion'

		# Select question
		questionIndex = @board.values.indexOf parseInt(data.value)
		@currentQuestion = @board.categories[data.category][questionIndex]
		@currentQuestion.category = data.category
		@currentQuestion.value = data.value
		@currentQuestion.button = event.target

		# Stop sound
		$('#question').on 'shown.bs.modal', =>
			soundManager.stop 'waiting'
			soundManager.play 'waiting' unless @currentQuestion.audio
		$('#question').on 'hidden.bs.modal', ->
			soundManager.stop 'waiting'

		# Is current question a daily double?
		if @currentQuestion.daily
			# Play daily double sound
			soundManager.play 'dailydouble'

			# Setup dailydouble values
			@dailydoubleMin = 100
			@dailydoubleMax = Math.max @currentPlayer.value, Math.max.apply(null, @board.values)
			@dailydouble = @dailydoubleMin

			# Show daily double modal
			$('#dailydouble').modal 'show'
			$('#dailydouble').on 'hidden.bs.modal', -> $('#question').modal 'show'
		else
			# Open board for players
			@enableOrDisablePlayerInput true

			# Deselect current player
			@players.forEach (element)-> element.isCurrentPlayer = false
			@currentPlayer = null

			# Show question modal
			$('#question').modal 'show'

		# Update buttons
		@lastUpdate = Date.now()

		# Key bindings
		Mousetrap.bind 'w', => @wrongAnswer()
		Mousetrap.bind 'c', => @correctAnswer()
		Mousetrap.bind ['l', 'esc'], => @leaveQuestion()
		Mousetrap.bind 'n', => @noAnswer() if not @currentQuestion.daily

		# Disable button
		$(event.target).attr 'disabled', true

	dailydoubleSelected: =>
		$('#dailydouble').modal 'hide'

	closeQuestion: =>
		# Set game state
		@state = 'gaming'

		# Hide question modal
		$('#question').modal 'hide'

		# Unbind keys
		Mousetrap.unbind ['w', 'c', 'l', 'n']

		# Remove current question
		@currentQuestion = null

		# Disable input
		@enableOrDisablePlayerInput false

		# Update counts
		if not @openQuestionsLeft()
			@showFinalScreen()

	leaveQuestion: =>
		$(@currentQuestion.button).attr 'disabled', false
		@closeQuestion()

	noAnswer: =>
		@currentQuestion.answered = true
		@closeQuestion()

	correctAnswer: =>
		return if @currentPlayer is null

		if @currentQuestion.daily
			@currentPlayer.value += parseInt @dailydouble
		else
			@currentPlayer.value += @currentQuestion.value

		@currentQuestion.answered = true
		@currentQuestion.answeredBy = @currentPlayer
		$(@currentQuestion.button).css 'background-color', @currentPlayer.color
		@closeQuestion()

	wrongAnswer: =>
		return if @currentPlayer is null

		if @currentQuestion.daily
			@currentPlayer.value -= parseInt @dailydouble
		else
			@currentPlayer.value -= @currentQuestion.value

		@players.forEach (element)-> element.isCurrentPlayer = false
		@currentPlayer = null
		@enableOrDisablePlayerInput()

		if @currentQuestion.daily
			@noAnswer()

	showFinalScreen: =>
		# Show final screen
		$('#finalScreen').modal 'show'

		# Enable closing
		Mousetrap.bind 'esc', ->
			$('#finalScreen').modal 'hide'
			Mousetrap.unbind 'esc'

# Init rivets
rivets.bind $('body'), @game = new GameController
