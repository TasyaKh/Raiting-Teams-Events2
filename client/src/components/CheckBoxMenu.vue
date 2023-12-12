<template>
  <div class="checkbox__nav">
    <div
      class="checkbox__block"
      v-for="menu_item in props.menu_items"
      :key="menu_item.id"
    >
      <div class="checkbox__title">{{ menu_item.title }}</div>
      <label
        class="checkbox__container"
        v-for="menu_type in menu_item.menu_types"
        :key="menu_type.id"
        :class="{ hidden: menu_item.hidden && menu_type.id > 4 }"
      >
        <input
          type="checkbox"
          class="checkbox"
          v-model="menu_type.checked"
          v-bind:key="menu_type.id"
        />
        <span class="fake"></span>
        <span class="span__title">{{ menu_type.title }}</span>
      </label>
      <div
        class="btn__open"
        v-if="menu_item.menu_types.length > 4"
        @click="menu_item.hidden = !menu_item.hidden"
      >
        <div class="btn__text" v-if="menu_item.hidden">Развернуть</div>
        <div v-else class="btn__text">Свернуть</div>
        <div class="btn__img" :class="{ closed: menu_item.hidden }"></div>
      </div>
    </div>
    <button class="apply__btn" @click="handleEventSetFilters()">
      Применить
    </button>
    <button class="refuse__btn" @click="handleEventResetFilters()">
      Сбросить
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  menu_items: {id: number, title: string, hidden: boolean, menu_types: {id: number, title: string, checked: boolean}[]}[];
  handleEventSetFilters: () => void; //обработчик отправки фильтров
  handleEventResetFilters: () => void;
}>();

// const filtersVisivle = ref(false)
</script>

<style scoped lang="scss">
.checkbox__block {
  margin-bottom: 1rem;
}

.checkbox__nav {
  .btn__open {
    display: flex;
    color: var(--second-color);
    padding-left: 0.5rem;

    &:hover {
      cursor: pointer;
    }

    .btn__img {
      background-image: url(@/assets/icon/closed.svg);
      margin-top: 0.1rem;
      height: 1rem;
      width: 2rem;

      &.closed {
        background-image: url(@/assets/icon/open.svg);
      }
    }
  }

  .checkbox__title {
    color: #373737;
    margin-bottom: 0.5rem;
  }

  .checkbox__container {
    padding: 0.2rem 0.5rem;
    display: flex;

    &.hidden {
      display: none;
    }

    &:hover {
      cursor: pointer;
    }

    .checkbox {
      display: none;

      &:checked + .fake::before {
        opacity: 1;
      }
    }

    .span__title {
      color: #a1a1a1;
      font-size: 1rem;
      margin-left: 1rem;
      hyphens: manual;
      width: 50%;
    }

    .span__title-dark {
      color: #373737;
    }

    .fake {
      display: inline-block;
      position: relative;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 0.3rem;
      background-color: var(--second-color-50);

      &:hover {
        cursor: pointer;
        background-color: var(--second-color);
      }
    }

    .fake::before {
      content: "";
      position: absolute;
      display: block;
      width: 1.5rem;
      height: 1.5rem;
      background-color: var(--second-color);
      background-image: url(@/assets/icon/checked.svg);
      border-radius: 0.3rem;
      transform: (-50%, -50%);
      opacity: 0;
      transition: 0.2s;
    }
  }

  .apply__btn {
    background-color: var(--main-color);
    color: #fff;
    height: 3rem;
    width: 100%;
    padding: 0.5rem;
    margin-top: 1rem;
  }

  .refuse__btn {
    border: 1px solid var(--main-color);
    color: var(--main-color);
    background: #fff;
    height: 3rem;
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>