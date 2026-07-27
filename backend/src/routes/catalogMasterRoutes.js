import express from "express";

import {
  createCatalogMaster,
  getCatalogMasters,
  getCatalogMasterById,
  updateCatalogMaster,
  updateCatalogMasterStatus,
  deleteCatalogMaster,
} from "../controllers/catalogMasterController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

import {
  createCatalogMasterSchema,
  updateCatalogMasterSchema,
} from "../validations/catalogMasterValidation.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin", "superadmin"));

router
  .route("/")
  .get(getCatalogMasters)
  .post(validate(createCatalogMasterSchema), createCatalogMaster);

router.route("/:id").get(getCatalogMasterById);

router
  .route("/:id")
  .patch(validate(updateCatalogMasterSchema), updateCatalogMaster)
  .delete(deleteCatalogMaster);

router.patch("/:id/status", updateCatalogMasterStatus);

export default router;