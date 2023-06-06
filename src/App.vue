<script>
import { v4 as uuidv4 } from 'uuid';
import PlusIcon from './assets/icons/PlusIcon.vue';
import TrashIcon from './assets/icons/TrashIcon.vue';
import CloseIcon from './assets/icons/CloseIcon.vue';
const API = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;

export default {
  name: 'App',

  components: {
    PlusIcon,
    TrashIcon,
    CloseIcon,
  },

  data() {
    return {
      ticker: '',
      tickers: [],
      selected: null,
      graph: [],
    };
  },

  methods: {
    add() {
      const currentTicker = { id: uuidv4(), title: this.ticker, value: '-' };
      this.tickers.push(currentTicker);

      setInterval(async () => {
        const result = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${currentTicker.title}&tsyms=USD&api_key=${API}`
        );
        const data = await result.json();

        const curTicker = this.tickers.find((t) => t.id === currentTicker.id);
        curTicker.value =
          data.USD > 1 ? data.USD.toFixed(2) : data.USD.toPrecision(2);

        if (this.selected.id === currentTicker.id) {
          this.graph.push(data.USD);
        }
      }, 3000);
      this.ticker = '';
    },

    deleteHandler(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t.id !== tickerToRemove.id);
    },

    selectHandler(ticker) {
      const prevId = this.selected?.id;
      this.selected = ticker;
      if (prevId === ticker.id) return;
      this.graph = [];
    },

    normalizeGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      return this.graph.map(
        (val) => 5 + ((val - minValue) * 95) / (maxValue - minValue)
      );
    },
  },
};
</script>

<template>
  <div
    class="container mx-auto flex min-h-screen flex-col items-center bg-gray-100 p-4"
  >
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
            <label for="wallet" class="block text-sm font-medium text-gray-700">
              Тикер
            </label>
            <div class="relative mt-1 rounded-md shadow-md">
              <input
                v-model="ticker"
                @keyup.enter="add"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full rounded-md border-gray-300 p-2 pr-10 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
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
          class="my-4 inline-flex items-center rounded-full border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium leading-4 text-white shadow-sm transition-colors duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <PlusIcon />
          Добавить
        </button>
      </section>

      <template v-if="tickers.length > 0">
        <hr class="my-4 w-full border-t border-gray-600" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in tickers"
            :key="t.title"
            @click="selectHandler(t)"
            :class="{
              'border-purple-800': selected === t,
            }"
            class="flex cursor-pointer flex-col items-center justify-between overflow-hidden rounded-lg border-4 border-solid bg-white shadow"
          >
            <div class="px-4 py-5 text-center sm:p-6">
              <dt class="truncate text-sm font-medium text-gray-500">
                {{ t.title }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ t.value }}
              </dd>
            </div>
            <button
              @click.stop="deleteHandler(t)"
              class="text-md flex w-full items-center justify-center bg-gray-100 px-4 py-4 font-medium text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-600 hover:opacity-20 sm:px-6"
            >
              <TrashIcon />
              Удалить
            </button>
          </div>
        </dl>
        <hr class="my-4 w-full border-t border-gray-600" />
      </template>
      <section v-if="selected" class="relative">
        <h3 class="my-8 text-lg font-medium leading-6 text-gray-900">
          {{ selected.title }} - USD
        </h3>
        <div class="flex h-64 items-end border-b border-l border-gray-600">
          <div
            v-for="(bar, idx) in normalizeGraph()"
            :key="idx"
            :style="{ height: `${bar}%` }"
            class="w-10 border bg-purple-800"
          />
        </div>
        <button
          @click="selected = null"
          type="button"
          class="absolute right-0 top-0"
        >
          <CloseIcon />
        </button>
      </section>
    </div>
  </div>
</template>
