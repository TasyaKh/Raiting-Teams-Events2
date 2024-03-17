<template>
  <div class="row">
     <div class="col-12">
       <div class="d-flex justify-content-between mb-3">
         <button @click="prevWeek" class="btn btn-primary">Предыдущая неделя</button>
         <h4>{{ getFormattedWeek() }}</h4>
         <button @click="nextWeek" class="btn btn-primary">Следующая неделя</button>
       </div>
       <table class="table">
         <thead>
           <tr>
             <th>Участники</th>
             <th v-for="(day, index) in weekDays" :key="index">{{ formatDate(day) }}</th>
           </tr>
         </thead>
         <tbody>
           <tr v-for="participant in participants" :key="participant.id">
             <td>{{ participant.name }}</td>
             <td v-for="(day, index) in weekDays" :key="index">
              <input type="checkbox" :checked="isVisited(participant.id, formatDate(day))" @change="updateVisitStatus(participant.id, formatDate(day), $event.target as HTMLInputElement)">
             </td>
           </tr>
         </tbody>
       </table>
     </div>
  </div>
 </template>
 
 <script lang="ts">
 import { defineComponent, ref, onMounted, computed } from 'vue';
 import { useTeamStore } from '@/store/team_store';
 
 interface Participant {
  id: number;
  name: string;
  visits: { [date: string]: boolean };
 }
 
 interface Visit {
  id: number;
  date_visit: string;
  status_visit: boolean | null;
  user: {
     id: number;
     fullname: string;
     education_group: string | null;
  };
 }
 
 interface VisitsResponse {
  id: number;
  team_visits: Visit[];
 }
 
 export default defineComponent({
  setup() {
     const teamStore = useTeamStore();
     const weekStart = ref(new Date());
     const participants = ref<Participant[]>([]);
     const visitsData = ref<Visit[]>([]);
 
     const fetchVisits = async (teamId: number) => {
       const visitsResponse: VisitsResponse = await teamStore.fetchVisits('2017-05-10T02:27:52.713Z', '2024-03-17T07:33:52.713Z', teamId);
       participants.value = visitsResponse.team_visits.map(visit => ({ id: visit.user.id, name: visit.user.fullname, visits: {} }));
       participants.value = participants.value.filter((name, index) => participants.value.findIndex(p=>p.name===name.name) === index);
       
       visitsData.value = visitsResponse.team_visits;
     };
 
     onMounted(() => {
       fetchVisits(6); // Замените   6 на ID вашей команды
     });
 
     const weekDays = computed(() => {
       const days: Date[] = [];
       const startDate = new Date(weekStart.value);
       for (let i = 0; i < 7; i++) {
         const day = new Date(startDate);
         day.setDate(startDate.getDate() + i);
         days.push(day);
       }
       return days;
     });
 
     const getFormattedWeek = () => {
       const startOfWeek = new Date(weekDays.value[0]);
       const endOfWeek = new Date(weekDays.value[6]);
       return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
     };
 
     const formatDate = (date: Date): string => {
       const year = date.getFullYear();
       const month = `0${date.getMonth() + 1}`.slice(-2);
       const day = `0${date.getDate()}`.slice(-2);
       return `${year}-${month}-${day}`;
     };
 
     const prevWeek = () => {
       weekStart.value = new Date(weekStart.value.getTime() - 7 * 24 * 60 * 60 * 1000);
     };
 
     const nextWeek = () => {
       weekStart.value = new Date(weekStart.value.getTime() + 7 * 24 * 60 * 60 * 1000);
     };
 
     const isVisited = (participantId: number, date: string): boolean => {
       const participant = visitsData.value.find(v => v.user.id === participantId && new Date(v.date_visit).toDateString() === new Date(date).toDateString());
       console.log(new Date(date).toJSON())
       console.log(visitsData) 
       console.log(participant)
       return participant?.status_visit ?? false;

     };
 
     const updateVisitStatus = (participantId: number, date: string, input: HTMLInputElement) => {
 const participant = participants.value.find(p => p.id === participantId);
 if (participant) {
    participant.visits[date] = input.checked;
 }
};

 
     return {
       participants,
       weekDays,
       getFormattedWeek,
       formatDate,
       prevWeek,
       nextWeek,
       isVisited,
       updateVisitStatus,
     };
  },
 });
 </script>
 
 <style lang="scss" scoped>
 /* Стили здесь */
 </style>
 