import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CaloriesChart from '../../src/components/CaloriesChart.vue'

describe('CaloriesChart Component', () => {
  let wrapper

  const mockData = [
    { date: '2024-01-10', calories: 1800 },
    { date: '2024-01-11', calories: 2100 },
    { date: '2024-01-12', calories: 1950 },
    { date: '2024-01-13', calories: 2200 },
    { date: '2024-01-14', calories: 1750 },
    { date: '2024-01-15', calories: 2000 }
  ]

  beforeEach(() => {
    wrapper = mount(CaloriesChart, {
      props: {
        data: mockData,
        height: 120,
        width: 320
      }
    })
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
      // Note: viewBox (camelCase) not viewbox in Vue
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
    it('should accept props correctly', () => {
      expect(wrapper.props('data')).toEqual(mockData)
      expect(wrapper.props('height')).toBe(120)
      expect(wrapper.props('width')).toBe(320)
    })

    it('should handle empty data gracefully', async () => {
      await wrapper.setProps({ data: [] })
      // Component should still render without errors
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('SVG Structure', () => {
    it('should have correct SVG structure', () => {
      const svg = wrapper.find('svg')
      expect(svg.find('defs').exists()).toBe(true)
      expect(svg.find('.grid-lines').exists()).toBe(true)
    })

    it('should generate paths when data is provided', () => {
      const paths = wrapper.findAll('path')
      expect(paths.length).toBeGreaterThan(0)
    })
  })

  describe('Props Reactivity', () => {
    it('should accept custom dimensions', async () => {
      await wrapper.setProps({
        width: 400,
        height: 200
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('400')
      expect(svg.attributes('height')).toBe('200')
    })

    it('should handle different data formats', async () => {
      const newData = [
        { date: '2024-01-01', calories: 1500 },
        { date: '2024-01-02', calories: 1600 }
      ]

      await wrapper.setProps({ data: newData })
      expect(wrapper.props('data')).toEqual(newData)
    })
  })

  describe('Responsive Behavior', () => {
    it('should maintain aspect ratio', () => {
      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBe('0 0 320 120')
      expect(svg.classes()).toContain('chart-svg')
    })
  })

  describe('Edge Cases', () => {
    it('should handle single data point', async () => {
      await wrapper.setProps({
        data: [{ date: '2024-01-01', calories: 2000 }]
      })

      // With single point, should still render without errors
      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.props('data')).toHaveLength(1)
    })

    it('should handle identical calorie values', async () => {
      const identicalData = [
        { date: '2024-01-01', calories: 2000 },
        { date: '2024-01-02', calories: 2000 },
        { date: '2024-01-03', calories: 2000 }
      ]

      await wrapper.setProps({ data: identicalData })
      expect(wrapper.props('data')).toHaveLength(3)
      // Should handle flat line without errors
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('should handle very large numbers', async () => {
      const largeData = [
        { date: '2024-01-01', calories: 100000 },
        { date: '2024-01-02', calories: 200000 }
      ]

      await wrapper.setProps({ data: largeData })
      expect(wrapper.props('data')).toHaveLength(2)
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })
}) 