import express from "express";
import { Application } from "../models/applicationSchema";
import {
  employerGetAllApplications,
  jobseekerDeleteApplication,
  jobseekerGetAllApplications,
  postApplication,
} from "../controllers/applicationController";
import { isAuthenticated } from "../middlewares/auth";

const router = express.Router();

router.post("/post", isAuthenticated, postApplication);
router.get("/employer/getall", isAuthenticated, employerGetAllApplications);
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);
router.put("/updateRoomId/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { jobseekerstatus } = req.body;

   
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

  
    application.jobseekerstatus = jobseekerstatus;
    await application.save();

    res.status(200).json({ success: true, message: "Job Seeker status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
export default router;
