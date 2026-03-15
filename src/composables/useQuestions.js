import { ref, computed } from 'vue'
import { parseAllFiles } from '../utils/parser'

const allQuestions = ref([])
const categories = ref(['all'])
const currentLibraryId = ref('frontend')

export function useQuestions() {
  async function loadQuestions(libraryId = 'frontend') {
    currentLibraryId.value = libraryId
    const result = await parseAllFiles(libraryId)
    allQuestions.value = result.questions
    categories.value = ['all', ...result.categories]
    return result
  }

  function getQuestionsByCategory(category) {
    if (category === 'all') {
      return allQuestions.value
    }
    return allQuestions.value.filter(q => q.category === category)
  }

  function getQuestionById(id) {
    return allQuestions.value.find(q => q.id === id)
  }

  function searchQuestions(query) {
    if (!query || !query.trim()) {
      return []
    }
    
    const searchTerm = query.toLowerCase().trim()
    
    return allQuestions.value.filter(q => {
      const questionMatch = q.question && q.question.toLowerCase().includes(searchTerm)
      const answerMatch = q.answer && q.answer.toLowerCase().includes(searchTerm)
      const topicMatch = q.topic && q.topic.toLowerCase().includes(searchTerm)
      const categoryMatch = q.category && q.category.toLowerCase().includes(searchTerm)
      return questionMatch || answerMatch || topicMatch || categoryMatch
    })
  }

  function getCurrentLibraryId() {
    return currentLibraryId.value
  }

  return {
    allQuestions,
    categories,
    currentLibraryId,
    loadQuestions,
    getQuestionsByCategory,
    getQuestionById,
    searchQuestions,
    getCurrentLibraryId
  }
}
