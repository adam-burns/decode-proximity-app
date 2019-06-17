/*
 * DECODE App – A mobile app to control your personal data
 *
 * Copyright (C) 2019 – DRIBIA Data Research S.L.
 *
 * DECODE App is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * DECODE App is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * email: info@dribia.com
 */

import { createSelector } from 'reselect';
import {
  prop, findIndex, equals, add, compose, head, map,
} from 'ramda';
import { getStats } from '../../api/credential-issuer-client';

const initialState = {
  firstRun: true,
  showTooltip: {
    dummy: 'refresh',
    dummyNext: 'crash',
  },
  total: '---',
  loading: false,
  date: '---',
};

export const ACTIONS = {
  FIRST_RUN_DONE: 'FIRST_RUN_DONE',
  TOOLTIP_SHOWN: 'TOOLTIP_SHOWN',
  REVIEW_WALKTHROUGH: 'REVIEW_WALKTHROUGH',
  REFRESH_STATS_REQUEST: 'REFRESH_STATS_REQUEST',
  REFRESH_STATS_SUCCESS: 'REFRESH_STATS_SUCCESS',
  REFRESH_STATS_FAILURE: 'REFRESH_STATS_FAILURE',
  REFRESH_DATE: 'REFRESH_DATE',
};

export const firstRunDone = () => ({
  type: ACTIONS.FIRST_RUN_DONE,
});

export const tooltipShown = (screen, id) => ({
  type: ACTIONS.TOOLTIP_SHOWN,
  screen,
  id,
});

export const reviewWalkthrough = () => ({
  type: ACTIONS.REVIEW_WALKTHROUGH,
});

export const refreshStats = () => async (dispatch) => {
  dispatch({
    type: ACTIONS.REFRESH_STATS_REQUEST,
  });
  try {
    const { total } = await getStats();
    dispatch({
      type: ACTIONS.REFRESH_STATS_SUCCESS,
      total,
    });
  } catch (e) {
    dispatch({
      type: ACTIONS.REFRESH_STATS_FAILURE,
      e,
    });
  }
};

export const refreshDate = () => ({
  type: ACTIONS.REFRESH_DATE,
  date: new Date(),
});

export const getTotal = prop('total');

export const getDate = prop('date');

export const getLoading = prop('loading');

export const getFirstRun = prop('firstRun');

const getBaseShowTooltip = prop('showTooltip');

export const getShowTooltip = screen => createSelector(
  getBaseShowTooltip,
  prop(screen),
);

const tooltips = {
  dummy: ['refresh', 'next'],
  dummyNext: ['crash'],
};

const nextTooltip = (screen, id) => {
  const nextIndex = compose(
    add(1),
    findIndex(equals(id)),
  )(tooltips[screen]);
  return tooltips[screen][nextIndex] || 'none';
};

const resetTooltips = () => map(head, tooltips);

export default (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.FIRST_RUN_DONE: {
      return {
        ...state,
        firstRun: false,
      };
    }
    case ACTIONS.TOOLTIP_SHOWN: {
      const { screen, id } = action;
      const { showTooltip } = state;
      return {
        ...state,
        showTooltip: {
          ...showTooltip,
          [screen]: nextTooltip(screen, id),
        },
      };
    }
    case ACTIONS.REVIEW_WALKTHROUGH: {
      return {
        ...state,
        showTooltip: resetTooltips(),
        firstRun: true,
      };
    }
    case ACTIONS.REFRESH_STATS_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case ACTIONS.REFRESH_STATS_SUCCESS: {
      const { total } = action;
      return {
        ...state,
        total,
        loading: false,
      };
    }
    case ACTIONS.REFRESH_STATS_FAILURE: {
      return {
        ...state,
        total: 'XXX',
        loading: false,
      };
    }
    case ACTIONS.REFRESH_DATE: {
      const { date } = action;
      return {
        ...state,
        date,
      };
    }
    default:
      return state;
  }
};
