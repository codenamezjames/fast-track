import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'

describe('Button', () => {
  describe('rendering', () => {
    it('should render button with default props', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Click me',
        },
      })

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toBe('Click me')
      expect(wrapper.classes()).toContain('button')
      expect(wrapper.classes()).toContain('button--primary')
      expect(wrapper.classes()).toContain('button--md')
    })

    it('should render with slot content', () => {
      const wrapper = mount(Button, {
        slots: {
          default: '<span>Custom Content</span>',
        },
      })

      expect(wrapper.html()).toContain('<span>Custom Content</span>')
    })
  })

  describe('variants', () => {
    it('should apply primary variant class', () => {
      const wrapper = mount(Button, {
        props: { variant: 'primary' },
      })
      expect(wrapper.classes()).toContain('button--primary')
    })

    it('should apply secondary variant class', () => {
      const wrapper = mount(Button, {
        props: { variant: 'secondary' },
      })
      expect(wrapper.classes()).toContain('button--secondary')
    })

    it('should apply danger variant class', () => {
      const wrapper = mount(Button, {
        props: { variant: 'danger' },
      })
      expect(wrapper.classes()).toContain('button--danger')
    })

    it('should apply ghost variant class', () => {
      const wrapper = mount(Button, {
        props: { variant: 'ghost' },
      })
      expect(wrapper.classes()).toContain('button--ghost')
    })

    it('should apply outline variant class', () => {
      const wrapper = mount(Button, {
        props: { variant: 'outline' },
      })
      expect(wrapper.classes()).toContain('button--outline')
    })
  })

  describe('sizes', () => {
    it('should apply small size class', () => {
      const wrapper = mount(Button, {
        props: { size: 'sm' },
      })
      expect(wrapper.classes()).toContain('button--sm')
    })

    it('should apply medium size class', () => {
      const wrapper = mount(Button, {
        props: { size: 'md' },
      })
      expect(wrapper.classes()).toContain('button--md')
    })

    it('should apply large size class', () => {
      const wrapper = mount(Button, {
        props: { size: 'lg' },
      })
      expect(wrapper.classes()).toContain('button--lg')
    })
  })

  describe('states', () => {
    it('should be disabled when disabled prop is true', () => {
      const wrapper = mount(Button, {
        props: { disabled: true },
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
      expect(wrapper.classes()).toContain('button--disabled')
    })

    it('should show loading state', () => {
      const wrapper = mount(Button, {
        props: { loading: true },
        slots: { default: 'Loading' },
      })

      expect(wrapper.find('.button__spinner').exists()).toBe(true)
      expect(wrapper.find('.button__content--loading').exists()).toBe(true)
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })

    it('should apply full width class', () => {
      const wrapper = mount(Button, {
        props: { fullWidth: true },
      })

      expect(wrapper.classes()).toContain('button--full-width')
    })
  })

  describe('button type', () => {
    it('should have button type by default', () => {
      const wrapper = mount(Button)
      expect(wrapper.find('button').attributes('type')).toBe('button')
    })

    it('should have submit type when specified', () => {
      const wrapper = mount(Button, {
        props: { type: 'submit' },
      })
      expect(wrapper.find('button').attributes('type')).toBe('submit')
    })

    it('should have reset type when specified', () => {
      const wrapper = mount(Button, {
        props: { type: 'reset' },
      })
      expect(wrapper.find('button').attributes('type')).toBe('reset')
    })
  })

  describe('interactions', () => {
    it('should emit click event when clicked', async () => {
      const wrapper = mount(Button)

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should not emit click when disabled', async () => {
      const wrapper = mount(Button, {
        props: { disabled: true },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('should not emit click when loading', async () => {
      const wrapper = mount(Button, {
        props: { loading: true },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })
})
