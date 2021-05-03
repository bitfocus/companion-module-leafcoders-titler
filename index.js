var instance_skel = require('../../instance_skel')
var debug
var log

function instance(system, id, config) {
	var self = this

	// super-constructor
	instance_skel.apply(this, arguments)

	self.actions() // export actions

	return self
}

instance.prototype.updateConfig = function (config) {
	var self = this

	self.config = config

	self.actions()
}

instance.prototype.init = function () {
	var self = this

	self.status(self.STATE_OK)

	debug = self.debug
	log = self.log
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				'Use this with https://github.com/LeafCoders/titler <br><B>Base URL</B> is the URL where Titler is running. <br><B>Type of key</B> is what type of keying you is used. <br><B>Default duration</B> set the viewing time of the title.',
		},
		{
			type: 'textinput',
			id: 'url',
			label: 'Base URL',
			width: 12,
			required: true,
		},
		{
			type: 'dropdown',
			label: 'Type of key',
			id: 'keydropdown',
			default: 'chroma',
			choices: [
				{ id: 'luma', label: 'Luma' },
				{ id: 'chroma', label: 'Chroma' },
			],
		},
		{
			type: 'number',
			id: 'defaultduration',
			label: 'Default duration',
			min: 1,
			max: 1000,
			default: 6,
			required: true,
		},
	]
}

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this
	debug('destroy')
}

instance.prototype.actions = function (system) {
	var self = this

	self.setActions({
		title: {
			label: 'Title',
			options: [
				{
					type: 'textinput',
					label: 'Name',
					id: 'name',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Title',
					id: 'title',
					default: '',
				},
				{
					type: 'number',
					label: 'Duration',
					id: 'duration',
					default: self.config.defaultduration,
				},
			],
		},
	})
}

instance.prototype.action = function (action) {
	var self = this
	var cmd

	if (self.config.url !== undefined && self.config.url.substring(0, 4) == 'http') {
		if (self.config.url.length > 0) {
			cmd =
				self.config.url +
				'?name=' +
				action.options.name +
				'&title=' +
				action.options.title +
				'&duration=' +
				action.options.duration +
				'&key=' +
				self.config.keydropdown
		}
	}

	if (action.action == 'title') {
		var header
		self.system.emit('rest_get', cmd, function (err, result) {
			if (err !== null) {
				self.log('error', 'HTTP GET Request failed (' + result.error.code + ')')
				self.status(self.STATUS_ERROR, result.error.code)
			} else {
				self.status(self.STATUS_OK)
			}
		})
	}
}

instance_skel.extendedBy(instance)
exports = module.exports = instance
