String::startsWith ?= (s) -> @[...s.length] is s
String::endsWith ?= (s) -> s is '' or @[-s.length..] is s

rivets.formatters.negate = (value)-> !value
rivets.binders['style-*'] = (el, value)-> el.style.setProperty @.args[0], value
