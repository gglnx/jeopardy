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

		# Load state
		@loadState()

		# Save state every secound
		@saveStateInternal = setInterval =>
			@lastUpdate = Date.now()
			@saveState()
		, 250

	saveState: =>
		localStorage.setItem @board.id, JSON.stringify @

	loadState: =>
		# Load old state
		oldState = JSON.parse localStorage.getItem(@board.id)
		for key, value of oldState
			@[key] = value

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
			player.isCurrentPlayer = true
			@currentPlayer = player
			@enableOrDisablePlayerInput()

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

			# See: https://github.com/mikeric/rivets/issues/452
			@currentPlayer.isCurrentPlayer = false if @currentPlayer
			@currentPlayer = players[0]
			@currentPlayer.isCurrentPlayer = true

		# Remove current player
		Mousetrap.bind 'shift+r', =>
			@currentPlayer.isCurrentPlayer = false if @currentPlayer
			@currentPlayer = null

		# Show final screen
		Mousetrap.bind 'f', =>
			@showFinalScreen() unless @currentQuestion

		# Restart game
		Mousetrap.bind 'shift+esc', =>
			clearInterval @saveStateInternal
			localStorage.removeItem @board.id
			window.location.reload()

		# Listen for player buzzers
		keys = []
		for player in @players
			keys.push "shift+#{player.key}"
		Mousetrap.bind keys, @playerBuzzes

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

		# Deselect current player
		@currentPlayer.isCurrentPlayer = false if @currentPlayer
		@currentPlayer = null

		# Update buttons
		@lastUpdate = Date.now()

		# Select question
		questionIndex = @board.values.indexOf parseInt(data.value)
		@currentQuestion = @board.categories[data.category][questionIndex]
		@currentQuestion.category = data.category
		@currentQuestion.value = data.value
		@currentQuestion.button = event.target

		# Show question modal
		$('#question').modal 'show'

		# Key bindings
		Mousetrap.bind 'w', => @wrongAnswer()
		Mousetrap.bind 'c', => @correctAnswer()
		Mousetrap.bind ['l', 'esc'], => @leaveQuestion()
		Mousetrap.bind 'n', => @noAnswer()

		# Disable button
		$(event.target).attr 'disabled', true

	closeQuestion: =>
		# Set game state
		@state = 'gaming'

		# Hide question modal
		$('#question').modal 'hide'

		# Unbind keys
		Mousetrap.unbind ['w', 'c', 'l', 'n']

		# Remove current question
		@currentQuestion = null

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

		@currentPlayer.value += @currentQuestion.value
		@currentQuestion.answered = true
		@currentQuestion.answeredBy = @currentPlayer
		$(@currentQuestion.button).css 'background-color', @currentPlayer.color
		@closeQuestion()

	wrongAnswer: =>
		return if @currentPlayer is null

		@currentPlayer.value -= @currentQuestion.value
		@currentPlayer.isCurrentPlayer = false if @currentPlayer
		@currentPlayer = null
		@enableOrDisablePlayerInput()

	showFinalScreen: =>
		# Show final screen
		$('#finalScreen').modal 'show'

		# Enable closing
		Mousetrap.bind 'esc', ->
			$('#finalScreen').modal 'hide'
			Mousetrap.unbind 'esc'

# Init rivets
rivets.bind $('body'), @game = new GameController
