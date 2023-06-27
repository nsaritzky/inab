import { FiChevronLeft, FiChevronRight } from "solid-icons/fi"
import { MonthYear } from "../types"
import { Component, useContext } from "solid-js"
import { CentralStoreContext } from "../App"

interface MonthSelectorProps {
  currentMonth: MonthYear
}

const MonthSelector: Component = () => {
  const [state, { setDecMonth, setIncMonth }] = useContext(CentralStoreContext)

  return (
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
}

export default MonthSelector
