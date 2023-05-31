<script>
import { v4 as uuidv4 } from 'uuid'
import PlusIcon from './assets/icons/PlusIcon.vue'
import TrashIcon from './assets/icons/TrashIcon.vue'
import CloseIcon from './assets/icons/CloseIcon.vue'
export default {
  name: 'App',

  components: {
    PlusIcon,
    TrashIcon,
    CloseIcon
  },

  data() {
    return {
      ticker: '',
      tickers: [],
      selected: null
    }
  },

  methods: {
    add() {
      const newTicker = { id: uuidv4(), title: this.ticker, value: '-' }
      this.tickers.push(newTicker)

      setInterval(async () => {
        const result = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${newTicker.title}&tsyms=USD&api_key=98e5704fc3c441f4e0ff5749a13a275758a8aec21c525b9ab49a8a7c58c64264`
        )
        const data = await result.json()
        const curTicker = this.tickers.find((t) => t.id === newTicker.id)
        curTicker.value = data.USD
      }, 3000)
      this.ticker = ''
    },

    deleteHandler(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t.id !== tickerToRemove.id)
    }
  }
}
</script>

<template>
  <div class="container mx-auto min-h-screen flex flex-col items-center bg-gray-100 p-4">
    <!-- <div
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div> -->
    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер {{ ticker }}</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="ticker"
                @keyup.enter="add"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full p-2 pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>
            <!-- <div class="flex bg-white p-1 rounded-md shadow-md flex-wrap">
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                BTC
              </span>
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                DOGE
              </span>
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                BCH
              </span>
              <span
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                CHD
              </span>
            </div> -->
            <!-- <div class="text-sm text-red-600">Такой тикер уже добавлен</div> -->
          </div>
        </div>
        <button
          @click="add"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <PlusIcon />
          Добавить
        </button>
      </section>

      <template v-if="tickers.length > 0">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in tickers"
            :key="t.title"
            @click="selected = t"
            :class="{
              'border-purple-800': selected === t
            }"
            class="flex flex-col justify-between items-center bg-white overflow-hidden shadow rounded-lg border-transparent border-4 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">{{ t.title }} - USD</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ t.value }}</dd>
            </div>
            <button
              @click.stop="deleteHandler(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all"
            >
              <TrashIcon />
              Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section v-if="selected" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">{{ selected.title }} - USD</h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div class="bg-purple-800 border w-10 h-24"></div>
          <div class="bg-purple-800 border w-10 h-32"></div>
          <div class="bg-purple-800 border w-10 h-48"></div>
          <div class="bg-purple-800 border w-10 h-16"></div>
        </div>
        <button @click="selected = null" type="button" class="absolute top-0 right-0">
          <CloseIcon />
        </button>
      </section>
    </div>
  </div>
</template>
