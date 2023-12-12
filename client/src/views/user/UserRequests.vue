<template>
  <!-- Навигация -->
  <div class="navigation wrapper-second__navigation border-block">
    <template v-for="(item, index) in itemList" :key="index">
      <a
        @click="selectItem(index)"
        :class="{ active: index == selectedItem }"
        >{{ item.name }}</a
      >
    </template>
  </div>

  <!-- see events -->
  <div v-if="selectedItem === 0"></div>

  <!-- see request for creation event -->
  <div v-if="selectedItem === 1">
    <div
      class="member-card border-block"
      v-for="(item, index) in requests"
      :key="index"
    >
      <div class="row ms-lg-3">
        <div class="col-lg-10 col-md-12">
          <div class="member-info p-3">
            <div class="col">
              <div class="row">
                <h4>{{ item.team?.title }}</h4>
              </div>
              <div class="row">
                Дата последнего рассмотрения: {{ item.date_update }}
              </div>
              <div class="row">Статус вашей заявки: {{ item.status?.name }}</div>
              <div class="row">
                Комментарий: {{ item.comment_leader ?? "-" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "@/assets/nav-second.scss";
import { usePermissionsStore } from "@/store/permissions_store";
import { ref, onBeforeMount } from "vue";
import type { Ref } from "vue";
import { useTeamStore } from "@/store/team_store";
import type { IRequisition } from "@/store/models/teams/requisition.model";

// import { useRoute } from "vue-router";
const permissions_store = usePermissionsStore();
// const route = useRoute();
const requests: Ref<IRequisition[]> = ref([]);
// const idUser = Number(route.query.user_id);

const itemList = [
  { name: "Мероприятия (заявки)" },
  { name: "Коллективы (заявки)" },
];

const selectedItem = ref(0);

onBeforeMount(async () => {
  requests.value = await useTeamStore().getUserRequisitions(
    permissions_store.user_id,
  );
});

const selectItem = (i: number) => {
  selectedItem.value = i;
};
</script>

<style lang="scss" scoped>
.member-card {
  width: 100%;

  margin-bottom: 12px;
  background: #fff;
  padding: 15px;
  border-radius: var(--border-radius);
}

.navigation {
  padding: 20px;
  margin-bottom: 20px;
  background: white;
}
</style>
