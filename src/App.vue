<script>
import { v4 as uuidv4 } from 'uuid';
import PlusIcon from './assets/icons/PlusIcon.vue';
import TrashIcon from './assets/icons/TrashIcon.vue';
import CloseIcon from './assets/icons/CloseIcon.vue';
import SpinnerIcon from './assets/icons/SpinnerIcon.vue';
import { subscribeToTicker, unsubscribeFromTicker } from './api';

export default {
  name: 'App',

  components: {
    PlusIcon,
    TrashIcon,
    CloseIcon,
    SpinnerIcon,
  },

  data() {
    return {
      ticker: '',
      filter: '',

      coinsData: [],
      autocompleteRes: [],
      errorMes: '',

      tickers: [],
      selectedTicker: null,

      graph: [],

      page: 1,
    };
  },

  created() {
    const urlFiltersData = Object.fromEntries(
      new URL(location).searchParams.entries()
    );

    const VALID_KEYS = ['filter', 'page'];

    VALID_KEYS.forEach((key) => {
      if (urlFiltersData[key]) {
        this[key] = urlFiltersData[key];
      }
    });

    const tickersData = localStorage.getItem('cryptonomicon-list');

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.title, (newPrice) =>
          this.updateTicker(ticker.title, newPrice)
        );
      });
    }

    setInterval(this.updateTickers, 5000);
  },

  mounted() {
    fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true')
      .then((res) => res.json())
      .then((coins) => {
        return (this.coinsData = Object.keys(coins.Data));
      });
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.title.toUpperCase().includes(this.filter.toUpperCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }

      return this.graph.map(
        (val) => 5 + ((val - minValue) * 95) / (maxValue - minValue)
      );
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  methods: {
    formatPrice(price) {
      if (price === '-') return price;
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    updateTicker(tickerName, price) {
      this.tickers
        .filter((t) => t.title === tickerName)
        .forEach((t) => {
          t.price = price;
          if (this.selectedTicker?.id === t.id && typeof price === 'number') {
            this.graph.push(price);
          }
        });
    },

    add(e) {
      this.errorMes = '';

      // If autocomplete
      const target = e.target;
      if (target.id === 'autocomplete') {
        this.ticker = target.textContent;
      }

      // Validate
      if (
        this.tickers.find(
          (t) => t.title.toUpperCase() === this.ticker.toUpperCase()
        )
      ) {
        this.errorMes = 'Такой тикер уже добавлен';
        return;
      } else if (!this.autocompleteRes.length) {
        this.errorMes = 'Такого тикера не существует';
        return;
      }

      const currentTicker = {
        id: uuidv4(),
        title: this.ticker.toUpperCase(),
        price: '-',
      };

      this.tickers = [...this.tickers, currentTicker];
      this.filter = '';
      subscribeToTicker(currentTicker.title, (newPrice) =>
        this.updateTicker(currentTicker.title, newPrice)
      );
      this.ticker = '';
      this.autocompleteRes = [];
    },

    deleteHandler(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t.id !== tickerToRemove.id);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerToRemove.title);
    },

    selectHandler(ticker) {
      this.selectedTicker = ticker;
    },

    autocomplete(e) {
      this.errorMes = '';
      const enteredData = e.target.value;
      if (!enteredData) {
        this.autocompleteRes = [];
        return;
      }

      const filteredCoins = this.coinsData.filter((coin) =>
        coin.toUpperCase().startsWith(enteredData.toUpperCase())
      );

      const exactMatch = this.coinsData.find(
        (coin) => coin.toUpperCase() === enteredData.toUpperCase()
      );

      const searchRes = filteredCoins.slice(0, 4);
      if (exactMatch) {
        searchRes.unshift(exactMatch);
        searchRes.pop();
      }
      this.autocompleteRes = searchRes;
    },
  },

  watch: {
    tickers() {
      localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers));
    },

    selectedTicker() {
      this.graph = [];
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    pageStateOptions(value) {
      history.pushState(
        null,
        document.title,
        `${location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },
};
</script>

<template>
  <div
    class="container mx-auto flex min-h-screen flex-col items-center bg-gray-100 p-4"
  >
    <div
      v-if="!coinsData.length"
      class="w-100 h-100 fixed inset-0 z-50 flex items-center justify-center bg-purple-800 opacity-80"
    >
      <SpinnerIcon />
    </div>
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
                @input="autocomplete"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full rounded-md border-gray-300 p-2 pr-10 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                placeholder="Например DOGE"
              />
            </div>
            <div
              v-if="autocompleteRes.length"
              class="flex flex-wrap rounded-md bg-white p-1 shadow-md"
            >
              <span
                v-for="suggestion in autocompleteRes"
                :key="suggestion"
                @click="add"
                :id="'autocomplete'"
                class="m-1 inline-flex cursor-pointer items-center rounded-md bg-gray-300 px-2 text-xs font-medium text-gray-800"
              >
                {{ suggestion }}
              </span>
            </div>
            <div v-if="errorMes" class="text-sm text-red-600">
              {{ errorMes }}
            </div>
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
        <div>
          <button
            class="mx-2 my-4 inline-flex items-center rounded-full border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium leading-4 text-white shadow-sm transition-colors duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            v-if="page > 1"
            @click="page = page - 1"
          >
            Назад
          </button>
          <button
            class="mx-2 my-4 inline-flex items-center rounded-full border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium leading-4 text-white shadow-sm transition-colors duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            v-if="hasNextPage"
            @click="page = page + 1"
          >
            Вперед
          </button>
          Фильтр: <input v-model="filter" @input="page = 1" />
        </div>
        <hr class="my-4 w-full border-t border-gray-600" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.title"
            @click="selectHandler(t)"
            :class="{
              'border-purple-800': selectedTicker === t,
            }"
            class="flex cursor-pointer flex-col items-center justify-between overflow-hidden rounded-lg border-4 border-solid bg-white shadow"
          >
            <div class="px-4 py-5 text-center sm:p-6">
              <dt class="truncate text-sm font-medium text-gray-500">
                {{ t.title }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
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
      <section v-if="selectedTicker" class="relative">
        <h3 class="my-8 text-lg font-medium leading-6 text-gray-900">
          {{ selectedTicker.title }} - USD
        </h3>
        <div class="flex h-64 items-end border-b border-l border-gray-600">
          <div
            v-for="(bar, idx) in normalizedGraph"
            :key="idx"
            :style="{ height: `${bar}%` }"
            class="w-10 border bg-purple-800"
          />
        </div>
        <button
          @click="selectedTicker = null"
          type="button"
          class="absolute right-0 top-0"
        >
          <CloseIcon />
        </button>
      </section>
    </div>
  </div>
</template>
