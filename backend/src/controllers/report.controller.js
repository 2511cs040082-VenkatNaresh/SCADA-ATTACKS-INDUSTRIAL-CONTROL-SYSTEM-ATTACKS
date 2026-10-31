import * as reportService from '../services/report.service.js';

export async function getReports(req, res, next) {
  try {
    const data = await reportService.getReports(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getReportById(req, res, next) {
  try {
    const data = await reportService.getReportById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createReport(req, res, next) {
  try {
    const data = await reportService.createReport(req.body, req.user?.id || 1, req.user?.username || 'soc_analyst');
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function generateReport(req, res, next) {
  try {
    const data = await reportService.createReport({ ...req.body, report_type: req.body.report_type || 'EXECUTIVE_SECURITY_SUMMARY' }, req.user?.id || 1, req.user?.username || 'soc_analyst');
    res.json({ success: true, message: 'Report generated successfully', data });
  } catch (err) {
    next(err);
  }
}

export async function exportReport(req, res, next) {
  try {
    const exportFormat = req.body.export_type || req.query.format || 'PDF';
    const exported = await reportService.exportReport(req.params.id, exportFormat, req.user?.id || 1, req.user?.username || 'soc_analyst');
    
    if (req.query.download === 'true') {
      res.setHeader('Content-Type', exported.mime_type);
      res.setHeader('Content-Disposition', `attachment; filename="${exported.file_name}"`);
      return res.send(exported.content);
    }
    
    res.json({ success: true, data: exported });
  } catch (err) {
    next(err);
  }
}

export async function getSchedules(req, res, next) {
  try {
    const data = await reportService.getSchedules();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createSchedule(req, res, next) {
  try {
    const data = await reportService.createSchedule(req.body, req.user?.id || 1, req.user?.username || 'soc_analyst');
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getHealth(req, res, next) {
  try {
    const data = await reportService.getReportsHealth();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
