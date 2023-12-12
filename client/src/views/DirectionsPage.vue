<template>
  <div class="wrapper-team wrapper-content border-block">
    <!-- Навигация -->
    <div class="wrapper-second__navigation">
      <a
        @click="
          selectItem(index);
          showCreate = false;
        "
        v-for="(direction, index) in directions"
        :key="index"
        :class="{ active: index == selectedItem }"
        >{{ direction.title }}</a
      >
    </div>

    <div class="wrapper-team__c
    reate">
      <div v-for="(direction, index) in directions" :key="index">
        <div class="content" v-if="index == selectedItem && !showCreate">
          <!--description  -->
          <p>({{ direction.shortname }}) {{ direction.description }}</p>
          <div class="alert alert-info">
            <div
              v-if="
                // !direction.functions ||
                (direction.functions &&
                  direction.functions[0]?.userFunctions)
              "
            >
              <p>
                Руководитель:
                {{ direction.functions[0]?.userFunctions[0]?.user?.fullname }}
              </p>

              <p>
                Почта:
                {{
                  direction.functions[0]?.userFunctions[0]?.user?.email ?? "-"
                }}
              </p>
              <p>
                Телефон:
               <span v-if="direction.functions && direction.functions[0]?.userFunctions"> {{
                  direction.functions[0]?.userFunctions[0]?.user?.phone ?? "-"
                }}</span>
              </p>
            </div>
            <div v-else>Руководитель не назначен</div>
            <p>Аудитория: {{ direction.cabinet ?? "-" }}</p>
          </div>
        </div>
      </div>
      <div class="">
        <button>
          Рейтинговая стипендия
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useTeamStore } from "@/store/team_store";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import "@/assets/nav-second.scss";
import type { ITeam } from "@/store/models/teams/team.model";
import type { Ref } from "vue";

const selectedItem = ref(0);
const showCreate = ref(false);
const directions: Ref<ITeam[]> = ref([]);
// store--------------------------------------------------------------
const teamStore = useTeamStore();

onBeforeMount(async () => {
  await getDirections();
});

const selectItem = (i: number) => {
  selectedItem.value = i;
};

async function getDirections() {
  // directions.value =  await teamStore.fetchTeamsOfDirection()

  const data = await teamStore.fetchDirections();
  directions.value = data[0];
}
</script>

<style lang="scss" scoped>
.btn {
  padding-top: 1rem;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: flex-start;
}

.wrapper-team {
  display: block;
  width: 100%;
  justify-content: center;
}
</style>
