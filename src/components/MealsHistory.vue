<template>
  <div class="meals-history">
    <div class="history-header">
      <h3 class="history-title">Recent Meals</h3>
      <q-btn
        flat
        round
        icon="refresh"
        size="sm"
        @click="refreshMeals"
        :loading="caloriesStore.isLoading"
        class="refresh-btn"
      />
    </div>

    <!-- Loading state -->
    <div v-if="caloriesStore.isLoading && displayMeals.length === 0" class="loading-state">
      <q-spinner color="primary" size="24px" />
      <span class="loading-text">Loading meals...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="displayMeals.length === 0" class="empty-state">
      <q-icon name="restaurant" size="48px" color="grey-4" />
      <div class="empty-text">No meals logged yet</div>
      <div class="empty-subtext">Start tracking your calories!</div>
    </div>

    <!-- Meals list -->
    <div v-else class="meals-list">
      <div
        v-for="meal in displayMeals"
        :key="meal.id"
        class="meal-item"
      >
        <div class="meal-content">
          <div class="meal-main">
            <div class="meal-calories">{{ formatNumber(meal.calories) }} kcal</div>
            <div class="meal-time">{{ formatTime(meal.meal_time) }}</div>
          </div>
          <div v-if="meal.notes" class="meal-notes">{{ meal.notes }}</div>
        </div>
        
        <div class="meal-actions">
          <q-btn
            flat
            round
            icon="edit"
            size="sm"
            @click="editMeal(meal)"
            class="action-btn edit-btn"
          />
          <q-btn
            flat
            round
            icon="delete"
            size="sm"
            @click="deleteMeal(meal)"
            class="action-btn delete-btn"
          />
        </div>
      </div>

      <!-- Show more button -->
      <div v-if="hasMoreMeals" class="show-more">
        <q-btn
          flat
          label="Show More"
          @click="showMore"
          class="show-more-btn"
        />
      </div>
    </div>

    <!-- Edit Meal Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card class="edit-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Edit Meal</div>
          <q-btn flat round dense icon="close" @click="closeEditDialog" />
        </q-card-section>

        <q-card-section class="dialog-content">
          <div class="edit-form">
            <q-input
              v-model="editForm.calories"
              type="number"
              label="Calories"
              outlined
              class="form-input"
            >
              <template v-slot:append>
                <span class="input-suffix">kcal</span>
              </template>
            </q-input>
            
            <q-input
              v-model="editForm.notes"
              label="Notes (optional)"
              outlined
              class="form-input"
              maxlength="100"
            />

            <div class="meal-time-info">
              <q-icon name="schedule" size="16px" />
              <span>{{ formatDateTime(editForm.meal_time) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancel" @click="closeEditDialog" />
          <q-btn 
            label="Save Changes" 
            color="primary" 
            unelevated
            @click="saveMealEdit"
            :loading="caloriesStore.isLoading"
            :disable="!editForm.calories || editForm.calories <= 0"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card class="delete-dialog">
        <q-card-section>
          <div class="text-h6">Delete Meal</div>
          <div class="delete-message">
            Are you sure you want to delete this meal?
            <div class="meal-details">
              <strong>{{ formatNumber(selectedMeal?.calories) }} kcal</strong>
              <span class="separator">•</span>
              <span>{{ formatDateTime(selectedMeal?.meal_time) }}</span>
            </div>
            <div v-if="selectedMeal?.notes" class="meal-notes-preview">
              "{{ selectedMeal.notes }}"
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeDeleteDialog" />
          <q-btn 
            label="Delete" 
            color="negative" 
            unelevated
            @click="confirmDelete"
            :loading="caloriesStore.isLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify } from 'quasar'
import { useCaloriesStore } from '../stores/calories.js'

const caloriesStore = useCaloriesStore()

// State
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedMeal = ref(null)
const displayLimit = ref(5)

const editForm = ref({
  id: null,
  calories: '',
  notes: '',
  meal_time: ''
})

// Computed
const displayMeals = computed(() => {
  return caloriesStore.meals
    .slice()
    .sort((a, b) => new Date(b.meal_time) - new Date(a.meal_time))
    .slice(0, displayLimit.value)
})

const hasMoreMeals = computed(() => {
  return caloriesStore.meals.length > displayLimit.value
})

// Methods
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const refreshMeals = async () => {
  await caloriesStore.loadMeals()
}

const showMore = () => {
  displayLimit.value += 5
}

const editMeal = (meal) => {
  selectedMeal.value = meal
  editForm.value = {
    id: meal.id,
    calories: meal.calories.toString(),
    notes: meal.notes || '',
    meal_time: meal.meal_time
  }
  showEditDialog.value = true
}

const deleteMeal = (meal) => {
  selectedMeal.value = meal
  showDeleteDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  selectedMeal.value = null
  editForm.value = {
    id: null,
    calories: '',
    notes: '',
    meal_time: ''
  }
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  selectedMeal.value = null
}

const saveMealEdit = async () => {
  try {
    await caloriesStore.updateMeal(
      editForm.value.id,
      parseInt(editForm.value.calories),
      editForm.value.notes
    )
    
    Notify.create({
      type: 'positive',
      message: 'Meal updated successfully',
      position: 'top',
      timeout: 2000
    })
    
    closeEditDialog()
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to update meal',
      position: 'top'
    })
  }
}

const confirmDelete = async () => {
  try {
    await caloriesStore.deleteMeal(selectedMeal.value.id)
    
    Notify.create({
      type: 'positive',
      message: 'Meal deleted successfully',
      position: 'top',
      timeout: 2000
    })
    
    closeDeleteDialog()
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to delete meal',
      position: 'top'
    })
  }
}

onMounted(async () => {
  if (caloriesStore.meals.length === 0) {
    await caloriesStore.loadMeals()
  }
})
</script>

<style scoped>
.meals-history {
  width: 100%;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.refresh-btn {
  color: #6c757d;
}

.refresh-btn:hover {
  color: #495057;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  color: #6c757d;
}

.loading-text {
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #6c757d;
  margin-top: 16px;
}

.empty-subtext {
  font-size: 14px;
  color: #adb5bd;
  margin-top: 4px;
}

.meals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meal-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.meal-item:hover {
  background: #e9ecef;
}

.meal-content {
  flex: 1;
  min-width: 0;
}

.meal-main {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.meal-calories {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.meal-time {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
}

.meal-notes {
  font-size: 13px;
  color: #6c757d;
  font-style: italic;
  margin-top: 4px;
  line-height: 1.4;
}

.meal-actions {
  display: flex;
  gap: 4px;
  margin-left: 12px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.edit-btn {
  color: #4f7cff;
}

.edit-btn:hover {
  background: rgba(79, 124, 255, 0.1);
}

.delete-btn {
  color: #dc3545;
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.1);
}

.show-more {
  text-align: center;
  margin-top: 8px;
}

.show-more-btn {
  color: #4f7cff;
  font-weight: 500;
}

/* Dialog Styles */
.edit-dialog,
.delete-dialog {
  border-radius: 16px;
  max-width: 400px;
  width: 90vw;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.dialog-content {
  padding: 24px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-input {
  width: 100%;
}

.input-suffix {
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

.meal-time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 14px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
}

.delete-message {
  margin-top: 16px;
  color: #6c757d;
  line-height: 1.5;
}

.meal-details {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.separator {
  color: #adb5bd;
}

.meal-notes-preview {
  margin-top: 8px;
  font-style: italic;
  color: #495057;
  font-size: 14px;
}
</style> 