import { register } from 'register-service-worker'
import { Notify } from 'quasar'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready(/* registration */) {
    // console.log('Service worker is active.')
  },

  registered(registration) {
    // Periodically check for updates (every 60 minutes)
    setInterval(
      () => {
        try {
          registration.update()
        } catch (err) {
          // Silently log to console to aid debugging without user disruption
          console.error('Service worker update check failed:', err)
        }
      },
      60 * 60 * 1000,
    )
  },

  cached(/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound(/* registration */) {
    // Optional: could show a subtle downloading indicator
  },

  updated(registration) {
    // New content available: prompt the user to refresh
    const doReload = () => {
      // If the new SW is waiting, tell it to activate immediately
      if (registration && registration.waiting) {
        // Listen for controlling SW change then reload
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => {
            window.location.reload()
          },
          { once: true },
        )
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      } else {
        window.location.reload()
      }
    }

    Notify.create({
      type: 'info',
      message: 'A new version is available.',
      timeout: 0,
      position: 'top',
      actions: [
        { label: 'Reload', color: 'white', handler: doReload },
        { label: 'Dismiss', color: 'white' },
      ],
    })
  },

  offline() {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error(/* err */) {
    // console.error('Error during service worker registration:', err)
  },
})
