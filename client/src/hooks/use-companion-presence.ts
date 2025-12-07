import { useEffect, useRef, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface EntityReference {
  type: "account" | "project" | "jobTheme" | "kpi" | "successStory";
  id: number;
  name?: string;
}

interface FormContext {
  formId: string;
  entityType: string;
  entityId?: number;
  isDirty: boolean;
  fieldsFocused?: string[];
}

interface PresenceState {
  currentRoute: string;
  previousRoutes: string[];
  activeEntities: EntityReference[];
  formContext: FormContext | null;
  lastSyncAt: string;
}

interface UseCompanionPresenceOptions {
  sessionId: string | null;
  debounceMs?: number;
}

export function useCompanionPresence({ 
  sessionId, 
  debounceMs = 500 
}: UseCompanionPresenceOptions) {
  const [location] = useLocation();
  const stateRef = useRef<PresenceState>({
    currentRoute: location,
    previousRoutes: [],
    activeEntities: [],
    formContext: null,
    lastSyncAt: new Date().toISOString(),
  });
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedRef = useRef<string>("");

  const syncState = useCallback(async (force: boolean = false) => {
    if (!sessionId) return;
    
    const stateJson = JSON.stringify(stateRef.current);
    if (!force && stateJson === lastSyncedRef.current) return;
    
    try {
      await apiRequest("PATCH", `/api/companion/sessions/${sessionId}/state`, {
        ...stateRef.current,
        lastSyncAt: new Date().toISOString(),
      });
      lastSyncedRef.current = stateJson;
    } catch (error) {
      console.error("Failed to sync companion presence:", error);
    }
  }, [sessionId]);

  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncState();
    }, debounceMs);
  }, [syncState, debounceMs]);

  useEffect(() => {
    if (location !== stateRef.current.currentRoute) {
      stateRef.current = {
        ...stateRef.current,
        previousRoutes: [
          stateRef.current.currentRoute,
          ...stateRef.current.previousRoutes.slice(0, 9),
        ],
        currentRoute: location,
      };
      debouncedSync();
    }
  }, [location, debouncedSync]);

  useEffect(() => {
    const entities = parseRouteForEntities(location);
    if (JSON.stringify(entities) !== JSON.stringify(stateRef.current.activeEntities)) {
      stateRef.current = {
        ...stateRef.current,
        activeEntities: entities,
      };
      debouncedSync();
    }
  }, [location, debouncedSync]);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const setFormContext = useCallback((context: FormContext | null) => {
    stateRef.current = {
      ...stateRef.current,
      formContext: context,
    };
    debouncedSync();
  }, [debouncedSync]);

  const trackEntityView = useCallback((entity: EntityReference) => {
    const existing = stateRef.current.activeEntities.find(
      e => e.type === entity.type && e.id === entity.id
    );
    if (!existing) {
      stateRef.current = {
        ...stateRef.current,
        activeEntities: [...stateRef.current.activeEntities, entity],
      };
      debouncedSync();
    }
  }, [debouncedSync]);

  const clearEntityTracking = useCallback(() => {
    stateRef.current = {
      ...stateRef.current,
      activeEntities: [],
    };
    debouncedSync();
  }, [debouncedSync]);

  const getPresenceState = useCallback(() => {
    return { ...stateRef.current };
  }, []);

  return {
    setFormContext,
    trackEntityView,
    clearEntityTracking,
    getPresenceState,
    syncNow: () => syncState(true),
  };
}

function parseRouteForEntities(route: string): EntityReference[] {
  const entities: EntityReference[] = [];
  
  const accountMatch = route.match(/\/accounts\/(\d+)/);
  if (accountMatch) {
    entities.push({ type: "account", id: parseInt(accountMatch[1]) });
  }
  
  const projectMatch = route.match(/\/projects\/(\d+)/);
  if (projectMatch) {
    entities.push({ type: "project", id: parseInt(projectMatch[1]) });
  }
  
  return entities;
}

export type { EntityReference, FormContext, PresenceState };
