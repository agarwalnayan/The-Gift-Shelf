import axiosInstance from "./axiosInstance";

export const getCatalogMastersApi = (params = {}) =>
  axiosInstance.get("/catalog-masters", { params });

export const getCatalogMasterByIdApi = (id) =>
  axiosInstance.get(`/catalog-masters/${id}`);

export const createCatalogMasterApi = (data) =>
  axiosInstance.post("/catalog-masters", data);

export const updateCatalogMasterApi = (id, data) =>
  axiosInstance.patch(`/catalog-masters/${id}`, data);

export const updateCatalogMasterStatusApi = (id, isActive) =>
  axiosInstance.patch(`/catalog-masters/${id}/status`, { isActive });

export const deleteCatalogMasterApi = (id) =>
  axiosInstance.delete(`/catalog-masters/${id}`);