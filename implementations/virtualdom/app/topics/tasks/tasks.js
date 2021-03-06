var model = require('model.js')
var tasksTemplate = require('./tasks-template')
var noTaskTemplate = require('./no-task-selected-template')
var all = require('async-all')

var UUID_V4_REGEX = '[a-f0-9-]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'

module.exports = function(stateRouter) {
	stateRouter.addState({
		name: 'app.topics.tasks',
		route: '/:topicId(' + UUID_V4_REGEX + ')',
		template: tasksTemplate,
		resolve: function resolve(data, parameters, cb) {
			var topicId = parameters.topicId
			all({
				topicId: topicId,
				topic: model.getTopic.bind(null, topicId),
				tasks: model.getTasks.bind(null, topicId)
			}, cb)
		},
		activate: function activate(context) {
			var domApi = context.domApi
			var el = domApi.el.querySelector('.add-new-task')
			el && el.focus()


			var topicId = context.content.topicId

			domApi.emitter.on('saveTasks', function saveTasks() {
				model.saveTasks(topicId, domApi.sharedState.tasks)
				domApi.update()
			})

			domApi.emitter.on('newTask', function (taskName) {
				var task = model.saveTask(topicId, taskName)
				domApi.sharedState.tasks.push(task)
				domApi.update()
			})
		}
	})

	stateRouter.addState({
		name: 'app.topics.no-task',
		template: noTaskTemplate
	})
}
