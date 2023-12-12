import { defineStore } from "pinia";
import { Status, Type } from "./enums/enum_event";
import type { IEventSearch } from "./models/event/events.model";
import {ApiRequest} from "@/store/handleApiRequest";
import axios from "axios";

export const useEventStore = defineStore("events", () => {
 const apiRequest = new ApiRequest()
  // type 4 is external
  async function fetchEvents(event: IEventSearch) {
    const params = {
      ...event,
      type: event.type != Type.ALL ? event.type : null,
      status: event.status != Status.ALL ? event.status : null,
      search_txt: event.search_text,
    };

    return apiRequest.handleApiRequest(async () => {
      return  await axios.get("/api/events", { params: params });
    });
  }

  // удалить мероприятие
  async function deleteEvent(id: number) {
    const res = await axios.delete("api/events/" + id);

    return res.data;
  }

  async function getEventsViaJournalsByTeam(
    teamId: number,
    dateStart: Date,
    dateEnd: Date,
    type: number = 0,
    level: number = 0,
  ) {
    const lvl = level != 0 ? level : null;
    const tp = type != 0 ? type : null;

    return await axios.get("api/events/events_of_team/" + teamId, {
      params: {
        level: lvl,
        type: tp,
        dateStart: dateStart.toISOString(),
        dateEnd: dateEnd.toISOString(),
      },
    });
  }

  // найти мероприятия по направлению
  async function getEventsByDirection(
    direction: number = 0,
    dateStart: Date,
    dateEnd: Date,
    level: number = 0,
    type: number = 0,
  ) {
    const lvl = level != 0 ? level : null;
    const tp = type != 0 ? type : null;
    const dr = direction != 0 ? direction : null;

    //need get all directions
    const res = await axios.get("api/events/", {
      params: {
        direction: dr,
        level: lvl,
        type: tp,
        dateStart: dateStart.toISOString(),
        dateEnd: dateEnd.toISOString(),
      },
    });

    return res.data;
  }

  async function getReportEventsOfDirection(
    direction: number = 0,
    dateStart: Date,
    dateEnd: Date,
    level: number = 0,
    type: number = 0,
  ) {
    const lvl = level != 0 ? level : null;
    const tp = type != 0 ? type : null;
    const dr = direction != 0 ? direction : null;

    //need get all directions
    return await axios.get("api/uploads/excel/events_direction", {
      params: {
        direction: dr,
        level: lvl,
        type: tp,
        dateStart: dateStart.toISOString(),
        dateEnd: dateEnd.toISOString(),
      },
      responseType: "arraybuffer",
    });
  }

  async function getReportEventsOfTeam(
    teamId: number,
    dateStart: Date,
    dateEnd: Date,
    type: number = 0,
    level: number = 0,
  ) {
    const lvl = level != 0 ? level : null;
    const tp = type != 0 ? type : null;

    return await axios.get("api/uploads/excel/events_of_team", {
      params: {
        teamId: teamId,
        level: lvl,
        type: tp,
        dateStart: dateStart.toISOString(),
        dateEnd: dateEnd.toISOString(),
      },
      responseType: "arraybuffer",
    });
  }

  const menu_items = [
    {
      id: 1,
      hidden:false,
      title: "Формат проведения",
      menu_types: [
        { id: 1, title: "Online", checked: true },
        { id: 2, title: "Offline", checked: true },
      ],
    },
    {
      id: 2,
      title: "Уровень",
      hidden:false,
      menu_types: [
        { id: 1, title: "Внутривузовский", checked: true },
        { id: 2, title: "Межвузовский", checked: true },
        { id: 3, title: "Региональный", checked: true },
        { id: 4, title: "Всероссийский", checked: true },
      ],
    },
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
  ];

  return {
    menu_items,
    fetchEvents,
    deleteEvent,

    getEventsByDirection,
    getReportEventsOfDirection,
    getEventsViaJournalsByTeam,
    getReportEventsOfTeam,
    apiRequest
  };
});
