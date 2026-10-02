/**
 * LifePass AI — Citizen Notifications Client Service
 *
 * Implements the client-side service boundary for retrieving citizen notifications.
 *
 * GOVERNANCE RULES:
 * - Does NOT invent unsupported backend notification endpoints.
 * - If backend endpoints are unprovisioned, this service falls back to
 *   isolated development fixtures and marks `isDevFixture: true`.
 * - Never present fixtures as real live backend events.
 */

import { supabase } from '../lib/supabase';
import { ApiError } from '@lifepass/shared';
import {
  NotificationItem,
  NotificationType,
  getFixtureNotifications,
  markFixtureNotificationRead,
  markAllFixtureNotificationsRead,
} from './fixtures/notificationFixtures';

export type {
  NotificationItem,
  NotificationType,
} from './fixtures/notificationFixtures';

export interface NotificationServiceResult<T> {
  data: T | null;
  error: ApiError | null;
  isDevFixture: boolean;
}

const BACKEND_SERVICE_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_AI_SERVICE_URL ||
  null;

/**
 * Fetch all notifications for the authenticated citizen.
 */
export async function fetchCitizenNotifications(): Promise<
  NotificationServiceResult<NotificationItem[]>
> {
  // 1. Try real backend endpoint if configured
  if (BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(`${BACKEND_SERVICE_BASE_URL}/notifications`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });

      if (response.ok) {
        const data = (await response.json()) as NotificationItem[];
        return { data, error: null, isDevFixture: false };
      }

      const errorJson = await response.json().catch(() => null);
      if (errorJson?.error) {
        return { data: null, error: errorJson.error, isDevFixture: false };
      }
    } catch {
      // Backend not yet reachable, fallback to development fixtures
    }
  }

  // 2. Controlled Development Fixture fallback
  try {
    const fixtureData = await getFixtureNotifications();
    return {
      data: fixtureData,
      error: null,
      isDevFixture: true,
    };
  } catch (err: unknown) {
    const apiError = err as ApiError;
    return {
      data: null,
      error: apiError.code
        ? apiError
        : {
            code: 'PROCESSING_FAILED',
            message: 'Unable to retrieve citizen notifications.',
          },
      isDevFixture: true,
    };
  }
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<NotificationServiceResult<NotificationItem>> {
  if (BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(
        `${BACKEND_SERVICE_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const data = (await response.json()) as NotificationItem;
        return { data, error: null, isDevFixture: false };
      }
    } catch {
      // Fallback
    }
  }

  try {
    const fixtureData = await markFixtureNotificationRead(notificationId);
    return {
      data: fixtureData,
      error: null,
      isDevFixture: true,
    };
  } catch (err: unknown) {
    const apiError = err as ApiError;
    return {
      data: null,
      error: apiError.code
        ? apiError
        : {
            code: 'PROCESSING_FAILED',
            message: 'Unable to update notification read state.',
          },
      isDevFixture: true,
    };
  }
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsAsRead(): Promise<
  NotificationServiceResult<NotificationItem[]>
> {
  if (BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(
        `${BACKEND_SERVICE_BASE_URL}/notifications/mark-all-read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const data = (await response.json()) as NotificationItem[];
        return { data, error: null, isDevFixture: false };
      }
    } catch {
      // Fallback
    }
  }

  try {
    const fixtureData = await markAllFixtureNotificationsRead();
    return {
      data: fixtureData,
      error: null,
      isDevFixture: true,
    };
  } catch (err: unknown) {
    const apiError = err as ApiError;
    return {
      data: null,
      error: apiError.code
        ? apiError
        : {
            code: 'PROCESSING_FAILED',
            message: 'Unable to mark all notifications as read.',
          },
      isDevFixture: true,
    };
  }
}
