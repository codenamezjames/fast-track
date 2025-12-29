/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const MealsController = () => import('#controllers/meals_controller')
const FastsController = () => import('#controllers/fasts_controller')
const StreaksController = () => import('#controllers/streaks_controller')
const RoutinesController = () => import('#controllers/routines_controller')
const WorkoutLogsController = () => import('#controllers/workout_logs_controller')
const ActivitiesController = () => import('#controllers/activities_controller')
const MeasurementsController = () => import('#controllers/measurements_controller')
const PushSubscriptionsController = () => import('#controllers/push_subscriptions_controller')

// Health check
router.get('/', async () => {
  return {
    app: 'Fast Track API',
    version: '2.0.0',
    status: 'healthy',
  }
})

// Auth routes (public)
router
  .group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
  })
  .prefix('/api/auth')

// Protected routes (require authentication)
router
  .group(() => {
    // Auth routes
    router
      .group(() => {
        router.post('/logout', [AuthController, 'logout'])
        router.get('/me', [AuthController, 'me'])
      })
      .prefix('/auth')

    // Meals routes
    router
      .group(() => {
        router.get('/', [MealsController, 'index'])
        router.post('/', [MealsController, 'store'])
        router.get('/daily-summary', [MealsController, 'dailySummary'])
        router.get('/:id', [MealsController, 'show'])
        router.put('/:id', [MealsController, 'update'])
        router.delete('/:id', [MealsController, 'destroy'])
      })
      .prefix('/meals')

    // Fasts routes
    router
      .group(() => {
        router.get('/', [FastsController, 'index'])
        router.post('/', [FastsController, 'store'])
        router.get('/active', [FastsController, 'active'])
        router.post('/:id/end', [FastsController, 'end'])
        router.delete('/:id', [FastsController, 'destroy'])
      })
      .prefix('/fasts')

    // Streaks routes
    router
      .group(() => {
        router.get('/', [StreaksController, 'show'])
        router.get('/daily-activities', [StreaksController, 'dailyActivities'])
        router.get('/today', [StreaksController, 'today'])
      })
      .prefix('/streaks')

    // Routines routes
    router
      .group(() => {
        router.get('/', [RoutinesController, 'index'])
        router.post('/', [RoutinesController, 'store'])
        router.get('/:id', [RoutinesController, 'show'])
        router.put('/:id', [RoutinesController, 'update'])
        router.delete('/:id', [RoutinesController, 'destroy'])
      })
      .prefix('/routines')

    // Workout logs routes
    router
      .group(() => {
        router.get('/', [WorkoutLogsController, 'index'])
        router.post('/', [WorkoutLogsController, 'store'])
        router.get('/active', [WorkoutLogsController, 'active'])
        router.get('/:id', [WorkoutLogsController, 'show'])
        router.post('/:id/end', [WorkoutLogsController, 'end'])
        router.delete('/:id', [WorkoutLogsController, 'destroy'])
      })
      .prefix('/workout-logs')

    // Activities routes
    router
      .group(() => {
        router.get('/', [ActivitiesController, 'index'])
        router.post('/', [ActivitiesController, 'store'])
        router.get('/active', [ActivitiesController, 'active'])
        router.get('/:id', [ActivitiesController, 'show'])
        router.post('/:id/end', [ActivitiesController, 'end'])
        router.put('/:id', [ActivitiesController, 'update'])
        router.delete('/:id', [ActivitiesController, 'destroy'])
      })
      .prefix('/activities')

    // Measurements routes
    router
      .group(() => {
        router.get('/', [MeasurementsController, 'index'])
        router.post('/', [MeasurementsController, 'store'])
        router.get('/latest', [MeasurementsController, 'latest'])
        router.get('/:id', [MeasurementsController, 'show'])
        router.put('/:id', [MeasurementsController, 'update'])
        router.delete('/:id', [MeasurementsController, 'destroy'])
      })
      .prefix('/measurements')

    // Push subscriptions routes
    router
      .group(() => {
        router.get('/', [PushSubscriptionsController, 'index'])
        router.post('/subscribe', [PushSubscriptionsController, 'subscribe'])
        router.delete('/:id', [PushSubscriptionsController, 'unsubscribe'])
        router.post('/unsubscribe-by-endpoint', [
          PushSubscriptionsController,
          'unsubscribeByEndpoint',
        ])
      })
      .prefix('/push-subscriptions')
  })
  .prefix('/api')
  .use(middleware.auth())
