<template>
  <!-- Блок с НОВОСТЯМИ -->
  <div class="news-panel">
    <div class="filters row g-3">
      <div class="col-auto">
        <SearchField :handle-timer-search="handleTimerSearch" />
      </div>

      <div class="col-auto">
        <div class="dropdown">
          <div
            class="block order"
            @click="isOrderExpanded = !isOrderExpanded"
            type="button"
            id="dropdownOrder"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <FontAwesomeIcon icon="sort" class="mx-2" />
            {{ filters.selectedFilterDate.name }}
            <FontAwesomeIcon
              v-if="!isOrderExpanded"
              icon="angle-down"
              class="mx-2"
            />
            <FontAwesomeIcon
              v-if="isOrderExpanded"
              icon="angle-up"
              class="mx-2"
            />
          </div>
          <ul class="block dropdown-menu" aria-labelledby="dropdownOrder">
            <li
              v-for="value in filterDate"
              @click="
                filters.selectedFilterDate = value;
                fetchEvents();
              "
              v-bind:key="value.id"
            >
              <div class="dropdown-item">
                <FontAwesomeIcon icon="sort" />
                {{ value.name }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <div v-if="events?.length <= 0 && !eventStore.apiRequest.loading" class="alert alert-warning" role="alert">
        Мероприятий нет
      </div>

      <div
        v-if="eventStore.apiRequest.loading"
        class="d-flex align-items-center justify-content-center mt-4"
      >
        <LoadingElem size-fa-icon="fa-3x" />
      </div>

      <div class="card mb-3 rounded-3" v-for="event in events" :key="event.id">
        <div class="row g-0">
          <div class="col-lg-4">
            <img
              :src="event.images ? event.images[0] : ''"
              class="img-fluid rounded-3"
              alt=""
            />
          </div>
          <div class="col-lg-8">
            <div class="card-body">
              <h5 class="card-title">{{ event.title }}</h5>
              <p class="card-text">
                {{
                      event.description && event.description?.length > 200
                              ? event.description?.slice(0, 200) + "..."
                              : "описания нет"
                  }}
              </p>
              <p class="card-text">
                <small class="text-muted"
                  >Дата проведения:
                  {{
                    event.dateStartRegistration
                      ? new Date(
                          event.dateStartRegistration,
                        ).toLocaleDateString()
                      : "-"
                  }}</small
                >
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <Pagination
        :max-page="maxPages"
        :visible-pages="visiblePages"
        :handleEventChangePage="handleEventChangePage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue";
import type { Ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import SearchField from "@/components/SearchField.vue";
import { useEventStore } from "@/store/events_store";
import type { IEvent, IEventSearch } from "@/store/models/event/events.model";
import LoadingElem from "@/components/LoadingElem.vue";
import Pagination from "@/components/PaginationElem.vue";

const eventStore = useEventStore();

//pagination ---------------------------------------------------------------------
const limit = 5; //сколько колелктивов отображается на странице
const offset = ref(0); //сколько коллективов пропустить прежде чем отобрад+зить

const maxPages = ref(1);
const visiblePages = 7;
//pagination ---------------------------------------------------------------------

const isCalendarExpanded = ref(false);
const calendarPicked = ref({
  start: new Date(new Date().getTime() - 31556952000),
  end: new Date(),
});

const isOrderExpanded = ref(false);
const events: Ref<IEvent[]> = ref([]);
const searchTxt = ref("");

const filterEvents: Ref<IEventSearch> = ref({});

const filterDate = [
  { id: 0, name: "Сначала новые", order: "DESC" },
  { id: 1, name: "Сначала старые", order: "ASC" },
];

const filters = ref({
  selectedFilterDate: filterDate[0],
});

const props = defineProps<{
  idTeam: number; //коллектив
}>();

onBeforeMount(() => {
  filterEvents.value.limit = limit;
  filterEvents.value.offset = offset.value;

  fetchEvents();
});

watch(
  () => calendarPicked.value.end,
  async () => {
    isCalendarExpanded.value = !isCalendarExpanded.value;
  },
);

async function handleEventChangePage(currentPage: number) {
  offset.value = (currentPage - 1) * limit;
  filterEvents.value.offset = offset.value;

  await fetchEvents();
}

async function fetchEvents() {
  filterEvents.value.journal_team_id = props.idTeam;
  filterEvents.value.search_text = searchTxt.value;
  filterEvents.value.date_update_order = filters.value.selectedFilterDate.order;
  const data = await eventStore.fetchEvents(filterEvents.value);
  events.value = data[0];

  const eventsCount = data[1];
  maxPages.value = eventsCount >= limit ? Math.ceil(eventsCount / limit) : 1;
}

async function handleTimerSearch(seachText: string) {
  searchTxt.value = seachText;

  await fetchEvents();
}
</script>

<style lang="scss" scoped>
.news-panel {
  .filters {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: 11px;
    margin-bottom: 30px;

    .block {
      padding: 7px 15px;
      border: 1.5px solid rgba(61, 61, 61, 0.1);
      border-radius: 15px;
    }

    .search {
      .icon {
        margin-right: 10px;
      }

      display: flex;
      align-items: center;
    }

    .date {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .order {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  @media screen and (min-width: 768px) {
    .news-card {
      display: flex;
      align-items: center;
    }
  }

  .news-card {
    .date {
      text-align: right;
      font-weight: bold;
      font-size: 10px;
      color: #7d7d7d;
    }

    .title {
      font-weight: bold;
    }

    .description {
      text-align: justify;
      font-size: 12px;
    }
  }
}

.dropdown {
  width: fit-content;
}

//for calendar
.calendar {
  display: none;
  position: absolute;
  right: 0px;
  background-color: #f9f9f9;
  min-width: 160px;
  z-index: 1;
  border-radius: 20px;

  &-visible {
    display: block;
  }
}
</style>
