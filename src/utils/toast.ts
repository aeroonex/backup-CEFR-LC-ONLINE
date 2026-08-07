"use client";

import React from 'react';

// Handlers for NotificationDialog
let setNotificationState: React.Dispatch<React.SetStateAction<{
  isOpen: boolean;
  message: string;
  title: string;
  type: "success" | "error";
}>> | null = null;

export const setNotificationHandlers = (setter: typeof setNotificationState) => {
  setNotificationState = setter;
};

// Handlers for LoadingIndicator
let setLoadingMessagesState: React.Dispatch<React.SetStateAction<Map<string | number, string>>> | null = null;
let loadingToastIdCounter = 0;

export const setLoadingHandlers = (setter: typeof setLoadingMessagesState) => {
  setLoadingMessagesState = setter;
};

export const showSuccess = (message: string, title: string = "Muvaffaqiyatli!") => {
  if (setNotificationState) {
    setNotificationState({ isOpen: true, message, title, type: "success" });
  } else {
    console.warn("Notification state setter not initialized. Success message:", message);
  }
};

export const showError = (message: string, title: string = "Xato!") => {
  if (setNotificationState) {
    setNotificationState({ isOpen: true, message, title, type: "error" });
  } else {
    console.warn("Notification state setter not initialized. Error message:", message);
  }
};

export const showLoading = (message: string): string | number => {
  if (setLoadingMessagesState) {
    const id = `loading-${loadingToastIdCounter++}`;
    setLoadingMessagesState(prev => {
      const newMap = new Map(prev);
      newMap.set(id, message);
      return newMap;
    });
    return id;
  } else {
    console.warn("Loading state setter not initialized. Loading message:", message);
    return -1; // Return a dummy ID
  }
};

export const dismissToast = (toastId: string | number) => {
  if (setLoadingMessagesState) {
    setLoadingMessagesState(prev => {
      const newMap = new Map(prev);
      newMap.delete(toastId);
      return newMap;
    });
  } else {
    console.warn("Loading state setter not initialized. Cannot dismiss toast:", toastId);
  }
};