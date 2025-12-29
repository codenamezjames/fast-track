import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { usePwa } from '../usePwa'

// Helper component to test composables with lifecycle hooks
const TestComponent = defineComponent({
  setup() {
    const pwa = usePwa()
    return { pwa }
  },
  template: '<div></div>',
})

describe('usePwa', () => {
  beforeEach(() => {
    // Reset navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })
  })

  it('should initialize with online status from navigator', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.pwa.isOnline.value).toBe(true)
    wrapper.unmount()
  })

  it('should initialize as offline when navigator is offline', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.pwa.isOnline.value).toBe(false)
    wrapper.unmount()
  })

  it('should have needRefresh initially false', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.pwa.needRefresh.value).toBe(false)
    wrapper.unmount()
  })

  it('should have updateAvailable initially false', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.pwa.updateAvailable.value).toBe(false)
    wrapper.unmount()
  })

  it('should update online status when window fires online event', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.pwa.isOnline.value).toBe(false)

    // Simulate going online
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })
    window.dispatchEvent(new Event('online'))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.pwa.isOnline.value).toBe(true)
    wrapper.unmount()
  })

  it('should update offline status when window fires offline event', async () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.pwa.isOnline.value).toBe(true)

    // Simulate going offline
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })
    window.dispatchEvent(new Event('offline'))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.pwa.isOnline.value).toBe(false)
    wrapper.unmount()
  })
})
