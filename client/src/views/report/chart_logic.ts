import { Type } from "@/store/enums/enum_event";
import { TypeSeason } from "@/views/report/enums_report";
import { useEventStore } from "@/store/events_store";
import { defineStore } from "pinia";

export const useChartStore = defineStore("echarts", () => {

    const eventStore = useEventStore();

    // подсчет количества внутренних/внешних мероприятий
    function countEventsInnerOuter(events: any) {

        let inner = 0
        let outer = 0

        for (let i = 0; i < events.length; i++) {

            let event = events[i]
            if (event.type != null && event.type.name == Type.INSIDE) inner += 1
            else if (event.type != null && event.type.name == Type.OUTSIDE) outer += 1
        }


        return [
            { value: inner, name: "Внутренние" },
            { value: outer, name: "Внешние" },]
    }


    // подсчет количества внутренних/внешних мероприятий
    function countEventsBySeason(events: any) {

        let spring = 0
        let summer = 0
        let autumn = 0
        let winter = 0

        for (let i = 0; i < events.length; i++) {

            let event = events[i]
            let date = new Date(event.dateStart)
            let month = date.getMonth()
            // console.log("event.date  " + new Date( event.dateStart))

            if (month <= 2 || month == 12) winter += 1
            else if (month <= 5) spring += 1
            else if (month <= 8) summer += 1
            else if (month <= 11) autumn += 1
            // else outer += 1
        }

        return [
            { value: spring, name: TypeSeason.SPRING },
            { value: autumn, name: TypeSeason.AUTUMN },
            { value: winter, name: TypeSeason.WINTER },
            { value: summer, name: TypeSeason.SUMMER },]
    }

    async function countTeamsEvents(teams: { name: string, id: number }[], dateStart: Date, dateEnd: Date,
        level: number,
        type: number, count = 10) {

        let dataTopTm: number[] = []
        let labelsTopTm: string[] = []

        let data: { data: number, label: string }[] = []

        // get count events from teams
        for (let i = 0; i < teams.length; i++) {
            const team = teams[i]

            let events = await eventStore.getEventsViaJournalsByTeam(team.id, dateStart, dateEnd, type, level)

            data.push({ data: events.data[1], label: team.name })
        }

        // sort data from min to max
        data.sort(function(a,b){return a.data - b.data})

        // prepare data top count teams for chart
        for (let i = 1; i < count; i++) {

            let ind = data.length - i

            if (data.length - i >= 0) {
                dataTopTm.push(data[ind].data)
                labelsTopTm.push(data[ind].label)
            }else break
        }

        return { dataTopTeams: dataTopTm, labelsTopTeams: labelsTopTm }
    }


    return {
        countEventsInnerOuter,
        countEventsBySeason,
        countTeamsEvents
    }
})