import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CaloriesChart from '../../src/components/CaloriesChart.vue'
import { useCaloriesStore } from '../../src/stores/calories.js'

describe('CaloriesChart Component', () => {
  let wrapper
  let caloriesStore

  const mockMeals = [
    { id: 1, calories: 300, meal_time: '2024-01-15T08:00:00.000Z', notes: 'Breakfast' },
    { id: 2, calories: 500, meal_time: '2024-01-15T12:00:00.000Z', notes: 'Lunch' },
    { id: 3, calories: 400, meal_time: '2024-01-14T18:00:00.000Z', notes: 'Dinner' },
    { id: 4, calories: 350, meal_time: '2024-01-13T19:00:00.000Z', notes: 'Dinner' },
  ]

  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
    })

    wrapper = mount(CaloriesChart, {
      props: {
        viewMode: 'weekly',
      },
      global: {
        plugins: [pinia],
      },
    })

    caloriesStore = useCaloriesStore()
    caloriesStore.meals = mockMeals
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.calories-chart').exists()).toBe(true)
    })

    it('should render SVG with correct dimensions', () => {
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.attributes('width')).toBe('320')
      expect(svg.attributes('height')).toBe('120')
      expect(svg.attributes('viewBox')).toBe('0 0 320 120')
    })

    it('should render grid lines', () => {
      const gridLines = wrapper.findAll('.grid-lines line')
      expect(gridLines.length).toBe(5)
    })

    it('should render gradient definition', () => {
      const gradient = wrapper.find('#chartGradient')
      expect(gradient.exists()).toBe(true)
    })
  })

  describe('Basic Functionality', () => {
    it('should accept viewMode prop correctly', () => {
      expect(wrapper.props('viewMode')).toBe('weekly')
    })

    it('should handle empty data gracefully', async () => {
      caloriesStore.meals = []
      await wrapper.vm.$nextTick()
      // Component should still render without errors
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('SVG Structure', () => {
    it('should have correct SVG structure', () => {
      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('chart-svg')

      // Check for essential SVG elements
      expect(wrapper.find('.grid-lines').exists()).toBe(true)
      expect(wrapper.find('#chartGradient').exists()).toBe(true)
    })

    it('should generate paths when data is provided', async () => {
      // Ensure we have data
      caloriesStore.meals = mockMeals
      await wrapper.vm.$nextTick()

      // Should have chart paths
      const paths = wrapper.findAll('path')
      expect(paths.length).toBeGreaterThan(0)
    })
  })

  describe('Props Reactivity', () => {
    it('should handle viewMode change', async () => {
      await wrapper.setProps({ viewMode: 'daily' })
      expect(wrapper.props('viewMode')).toBe('daily')
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('should handle different viewMode values', async () => {
      // Test weekly mode
      await wrapper.setProps({ viewMode: 'weekly' })
      expect(wrapper.props('viewMode')).toBe('weekly')

      // Test daily mode
      await wrapper.setProps({ viewMode: 'daily' })
      expect(wrapper.props('viewMode')).toBe('daily')
    })
  })

  describe('Responsive Behavior', () => {
    it('should maintain aspect ratio', () => {
      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBe('0 0 320 120')
      // Width/height ratio should be maintained via viewBox
    })
  })

  describe('Edge Cases', () => {
    it('should handle single data point', async () => {
      caloriesStore.meals = [
        { id: 1, calories: 1500, meal_time: '2024-01-15T12:00:00.000Z', notes: 'Lunch' },
      ]
      await wrapper.vm.$nextTick()

      // With single point, should still render without errors
      expect(wrapper.find('svg').exists()).toBe(true)
      expect(caloriesStore.meals).toHaveLength(1)
    })

    it('should handle no meals for current period', async () => {
      // Set meals from a different time period
      caloriesStore.meals = [
        { id: 1, calories: 1500, meal_time: '2023-01-15T12:00:00.000Z', notes: 'Old meal' },
      ]
      await wrapper.vm.$nextTick()

      // Should handle gracefully
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('should handle very large calorie values', async () => {
      caloriesStore.meals = [
        { id: 1, calories: 10000, meal_time: '2024-01-15T12:00:00.000Z', notes: 'Large meal' },
        { id: 2, calories: 15000, meal_time: '2024-01-14T12:00:00.000Z', notes: 'Huge meal' },
      ]
      await wrapper.vm.$nextTick()

      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('Day Labels', () => {
    it('should render day labels for weekly mode', async () => {
      await wrapper.setProps({ viewMode: 'weekly' })
      await wrapper.vm.$nextTick()

      const dayLabels = wrapper.findAll('.day-label')
      expect(dayLabels.length).toBe(7) // 7 days in week
    })

    it('should render time labels for daily mode', async () => {
      await wrapper.setProps({ viewMode: 'daily' })
      await wrapper.vm.$nextTick()

      const dayLabels = wrapper.findAll('.day-label')
      expect(dayLabels.length).toBe(6) // 6 time periods in day
    })
  })
})
