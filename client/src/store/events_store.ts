import { defineStore } from "pinia";
import axios from "axios";
import { Status, Type } from "./enums/enum_event";
import type { Event } from "./models/events.model";
import { useDictionaryStore } from "./dictionary_store";
import { EVENT_LEVEL, EVENT_TYPE } from "./constants/constants_class_names";

export const useEventStore = defineStore("events", () => {

  const dictionaryStore = useDictionaryStore();
  // type 4 is external
  async function fetchEvents(event: Event): Promise<any> {


    let params = {
      ...event,
      type: event.type,
      status: event.status != Status.ALL ? event.status : null,
      search_txt: event.search_text
    }


    const res = await axios.get('api/events', { params: params })

    const data = res.data

    return data
  }

  async function fetchEventById(id: number, dateStart: Date, dateEnd: Date, level: number = 0, type: number = 0
  ): Promise<any> {

    let lvl = level != 0 ? level : null
    let tp = type != 0 ? type : null

    const res = await axios.get('api/events', {
      params: {
        id: id,
        level: lvl, type: tp,
        dateStart: dateStart.toISOString(), dateEnd: dateEnd.toISOString()
      }
    })

    const data = res.data[0]

    return data[0]
  }

  // удалить мероприятие
  async function deleteEvent(id: number) {

    const res = await axios.delete('api/events/' + id)

    const data = res.data

    return data
  }


  async function getEventsViaJournalsByTeam(teamId: number, dateStart: Date, dateEnd: Date,
    type: number = 0, level: number = 0): Promise<any> {

    let lvl = level != 0 ? level : null
    let tp = type != 0 ? type : null

    const res = await axios.get('api/events/events_of_team/' + teamId, {
      params: {
        level: lvl, type: tp,
        dateStart: dateStart.toISOString(), dateEnd: dateEnd.toISOString()
      }
    })

    const data = res

    return data
  }

  // найти мероприятия по направлению
  async function getEventsByDirection(direction: number = 0,
    dateStart: Date, dateEnd: Date, level: number = 0, type: number = 0
  ): Promise<any> {



    let res = null

    let lvl = level != 0 ? level : null
    let tp = type != 0 ? type : null
    let dr = direction != 0 ? direction : null


    //need get all directions
    res = await axios.get('api/events/', {
      params: {
        direction: dr, level: lvl, type: tp,
        dateStart: dateStart.toISOString(), dateEnd: dateEnd.toISOString()
      }
    })

    const data = res.data

    return data
  }


  async function getReportEventsOfDirection(direction: number = 0,
    dateStart: Date, dateEnd: Date, level: number = 0, type: number = 0
  ) {

    let res = null

    let lvl = level != 0 ? level : null
    let tp = type != 0 ? type : null
    let dr = direction != 0 ? direction : null


    //need get all directions
    res = await axios.get('api/uploads/excel/events_direction', {
      params: {
        direction: dr, level: lvl, type: tp,
        dateStart: dateStart.toISOString(), dateEnd: dateEnd.toISOString()
      },
      responseType: "arraybuffer"
    })


    return res
  }


  async function getReportEventsOfTeam(teamId: number, dateStart: Date, dateEnd: Date,
    type: number = 0, level: number = 0) {

    let lvl = level != 0 ? level : null
    let tp = type != 0 ? type : null

    const res = await axios.get('api/uploads/excel/events_of_team', {
      params: {
        teamId: teamId,
        level: lvl, type: tp,
        dateStart: dateStart.toISOString(), dateEnd: dateEnd.toISOString()
      },
      responseType: "arraybuffer"
    })

    return res
  }

  // получить меню для мероприятий со словаря
  async function getMenuItems() {

    let indexMenu = 0
    const menu_items:any = []

    let fillMenu = async (dictClassId: number, menuTitle: string) => {
     
      let dictionary = await dictionaryStore.getFromDictionaryByClassID(dictClassId)

      //получить уровень мероприятия с БД
      let menu_types = []
      for (let i = 0; i < dictionary.length; i++) {
        menu_types.push(
          // id со словаря, название, ставить галочку
          { id: dictionary[i].id, title: dictionary[i].name, checked: true }
        )
      }

      menu_items.push({ id: indexMenu, title: menuTitle, menu_types: menu_types })
      indexMenu++
    }

    await fillMenu(EVENT_TYPE, "Тип")
    await fillMenu(EVENT_LEVEL, "Уровень")

    return menu_items
  }



  // const menu_items = [
  //   {
  //     id: 1, title: 'Формат проведения', menu_types: [
  //       { id: 1, title: 'Online', checked: true },
  //       { id: 2, title: 'Offline', checked: true },
  //     ]
  //   },
  //   {
  //     id: 2, title: 'Уровень', menu_types: [
  //       { id: 1, title: 'Внутривузовский', checked: true },
  //       { id: 2, title: 'Межвузовский', checked: true },
  //       { id: 3, title: 'Региональный', checked: true },
  //       { id: 4, title: 'Всероссийский', checked: true },
  //     ]
  //   },

  // {
  //   id: 3, title: 'Институт', hidden: true, menu_types: [
  //     { id: 1, title: 'Авиамашиностроения и транспорта' },
  //     { id: 2, title: 'Архитектуры, строительства и дизайна' },
  //     { id: 3, title: 'Высоких технологий' },
  //     { id: 4, title: 'Информационных технологий и анализа даных' },
  //     { id: 5, title: 'Квантовой физики' },
  //     { id: 6, title: 'Лингвистики и межкультурной коммуникации' },
  //     { id: 7, title: 'Недропользования' },
  //     { id: 8, title: 'Экономики, управления и права' },
  //     { id: 9, title: 'Энергетики' },
  //     { id: 10, title: 'БРИКС' },
  //   ]
  // },
  // {
  //   id: 4, title: 'Курс', hidden: true, menu_types: [
  //     { id: 1, title: '1 курс' },
  //     { id: 2, title: '2 курс' },
  //     { id: 3, title: '3 курс' },
  //     { id: 4, title: '4 курс' },
  //     { id: 5, title: '5 курс' },
  //     { id: 6, title: 'Магистратура' },
  //   ]
  // }
  // ]

  return {
    getMenuItems,
    // menu_items,
    fetchEvents,
    fetchEventById,
    deleteEvent,

    getEventsByDirection,
    getReportEventsOfDirection,
    getEventsViaJournalsByTeam,
    getReportEventsOfTeam
  }
})