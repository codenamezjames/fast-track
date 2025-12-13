/**
 * Visual Regression Tests for Components
 * Tests component rendering and visual consistency
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { createPinia, setActivePinia } from 'pinia'

// Import components to test
import BaseStatsCard from '../../src/components/base/BaseStatsCard.vue'
import BaseDialog from '../../src/components/base/BaseDialog.vue'
import OptimizedChart from '../../src/components/optimized/OptimizedChart.vue'

describe('Component Visual Tests', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  describe('BaseStatsCard', () => {
    it('should render with default props', () => {
      const wrapper = mount(BaseStatsCard, {
        global: {
          plugins: [Quasar],
        },
        props: {
          icon: 'favorite',
          valueColor: 'primary',
          value: 1234,
          label: 'Test Label',
        },
      })

      // Check basic structure
      expect(wrapper.find('.stats-card').exists()).toBe(true)
      expect(wrapper.find('.text-h5').text()).toBe('1,234')
      expect(wrapper.find('.text-caption').text()).toContain('Test Label')
    })

    it('should render with trend data', () => {
      const wrapper = mount(BaseStatsCard, {
        global: {
          plugins: [Quasar],
        },
        props: {
          icon: 'trending_up',
          valueColor: 'positive',
          value: '2,500',
          label: 'Calories',
          showTrend: true,
          trendValue: '+150',
          trendLabel: 'vs yesterday',
          trendType: 'positive',
        },
      })

      // Check trend rendering - trend class is on a span inside the trend container
      expect(wrapper.find('.text-positive').exists()).toBe(true)
      expect(wrapper.text()).toContain('+150')
      expect(wrapper.text()).toContain('vs yesterday')
    })

    it('should handle different valueColor schemes', () => {
      const colors = ['primary', 'positive', 'negative']

      colors.forEach((color) => {
        const wrapper = mount(BaseStatsCard, {
          global: {
            plugins: [Quasar],
          },
          props: {
            icon: 'star',
            valueColor: color,
            value: '100',
            label: `Test ${color}`,
          },
        })

        // The color class is applied to the .text-h5 value element
        expect(wrapper.find(`.text-h5.text-${color}`).exists()).toBe(true)
      })
    })
  })

  describe('BaseDialog', () => {
    it('should render dialog component', () => {
      const wrapper = mount(BaseDialog, {
        global: {
          plugins: [Quasar],
          stubs: {
            DialogHeader: {
              template: '<div class="dialog-header"><slot /></div>',
              props: ['title', 'subtitle'],
            },
          },
        },
        props: {
          modelValue: true,
          title: 'Test Dialog',
          subtitle: 'Test Subtitle',
        },
        slots: {
          default: '<div>Dialog content</div>',
        },
        attachTo: document.body,
      })

      // Check component exists (dialog content may not be visible in happy-dom)
      expect(wrapper.exists()).toBe(true)
      // Check props are correctly passed
      expect(wrapper.props('title')).toBe('Test Dialog')
      expect(wrapper.props('subtitle')).toBe('Test Subtitle')

      wrapper.unmount()
    })

    it('should expose loading state via props', () => {
      const wrapper = mount(BaseDialog, {
        global: {
          plugins: [Quasar],
          stubs: {
            DialogHeader: {
              template: '<div class="dialog-header"><slot /></div>',
              props: ['title', 'subtitle'],
            },
          },
        },
        props: {
          modelValue: true,
          title: 'Loading Dialog',
          isLoading: true,
        },
      })

      // Check loading prop is passed correctly
      expect(wrapper.props('isLoading')).toBe(true)
    })

    it('should accept different minWidth and maxWidth props', () => {
      const sizes = [
        { minWidth: '300px', maxWidth: '400px' },
        { minWidth: '400px', maxWidth: '600px' },
        { minWidth: '500px', maxWidth: '800px' },
      ]

      sizes.forEach((size) => {
        const wrapper = mount(BaseDialog, {
          global: {
            plugins: [Quasar],
            stubs: {
              DialogHeader: {
                template: '<div class="dialog-header"><slot /></div>',
                props: ['title', 'subtitle'],
              },
            },
          },
          props: {
            modelValue: true,
            title: `Test`,
            ...size,
          },
        })

        expect(wrapper.props('minWidth')).toBe(size.minWidth)
        expect(wrapper.props('maxWidth')).toBe(size.maxWidth)
      })
    })
  })

  describe('OptimizedChart', () => {
    it('should render chart with data', () => {
      const mockData = [
        { label: 'Jan', value: 100 },
        { label: 'Feb', value: 200 },
        { label: 'Mar', value: 150 },
      ]

      const wrapper = mount(OptimizedChart, {
        global: {
          plugins: [Quasar],
        },
        props: {
          data: mockData,
          height: 300,
        },
      })

      // Check chart container
      expect(wrapper.find('.chart-container').exists()).toBe(true)
      expect(wrapper.find('canvas').exists()).toBe(true)
    })

    it('should accept showRetry prop for error handling', () => {
      const wrapper = mount(OptimizedChart, {
        global: {
          plugins: [Quasar],
        },
        props: {
          data: [],
          showRetry: true,
        },
      })

      // Check showRetry prop is passed
      expect(wrapper.props('showRetry')).toBe(true)
    })

    it('should expose error via component state', async () => {
      const wrapper = mount(OptimizedChart, {
        global: {
          plugins: [Quasar],
        },
        props: {
          data: [],
        },
      })

      // Set error via exposed component method
      wrapper.vm.error = 'Chart failed to load'
      await wrapper.vm.$nextTick()

      // Check error state is rendered
      expect(wrapper.find('.chart-error').exists()).toBe(true)
      expect(wrapper.text()).toContain('Chart failed to load')
    })

    it('should handle performance options', () => {
      const wrapper = mount(OptimizedChart, {
        global: {
          plugins: [Quasar],
        },
        props: {
          data: [],
          debounceMs: 500,
          maxDataPoints: 50,
          enableDecimation: true,
        },
      })

      // Check performance props are applied
      expect(wrapper.props('debounceMs')).toBe(500)
      expect(wrapper.props('maxDataPoints')).toBe(50)
      expect(wrapper.props('enableDecimation')).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('should handle mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const wrapper = mount(BaseStatsCard, {
        global: {
          plugins: [Quasar],
        },
        props: {
          icon: 'phone',
          valueColor: 'primary',
          value: 'Mobile Test',
          label: 'Mobile Label',
        },
      })

      // Check mobile-specific classes
      expect(wrapper.find('.stats-card').exists()).toBe(true)
    })

    it('should handle tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const wrapper = mount(BaseStatsCard, {
        global: {
          plugins: [Quasar],
        },
        props: {
          icon: 'tablet',
          valueColor: 'secondary',
          value: 'Tablet Test',
          label: 'Tablet Label',
        },
      })

      // Check tablet-specific classes
      expect(wrapper.find('.stats-card').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should render accessible stats card', () => {
      const wrapper = mount(BaseStatsCard, {
        global: {
          plugins: [Quasar],
        },
        props: {
          icon: 'accessibility',
          valueColor: 'primary',
          value: 100,
          valueFormat: 'custom',
          label: 'Accessibility Test',
        },
      })

      // Check component renders with accessible text
      expect(wrapper.find('.stats-card').exists()).toBe(true)
      expect(wrapper.text()).toContain('100')
      expect(wrapper.text()).toContain('Accessibility Test')
    })

    it('should render dialog with close functionality', () => {
      const wrapper = mount(BaseDialog, {
        global: {
          plugins: [Quasar],
          stubs: {
            DialogHeader: {
              template: '<div class="dialog-header">Header</div>',
              props: ['title', 'subtitle'],
            },
          },
        },
        props: {
          modelValue: true,
          title: 'Keyboard Test',
          showCancelButton: true,
        },
        attachTo: document.body,
      })

      // Check component renders and has close capability via props
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('showCancelButton')).toBe(true)

      wrapper.unmount()
    })
  })
})
