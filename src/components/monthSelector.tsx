import { FiChevronLeft, FiChevronRight } from "solid-icons/fi"
import { MonthYear } from "../types"
import { setIncMonth, setDecMonth, state } from "../store"
import { Component } from "solid-js"

interface MonthSelectorProps {
  currentMonth: MonthYear
}

const MonthSelector: Component = () => (
  <div class="flex">
    <button
      onClick={(e) => {
        e.preventDefault()
        setDecMonth()
      }}
    >
      <FiChevronLeft size={24} />
    </button>
    <span>{state.currentMonth}</span>
    <button
      onClick={(e) => {
        e.preventDefault()
        setIncMonth()
      }}
    >
      <FiChevronRight size={24} />
    </button>
  </div>
)

export default MonthSelector
