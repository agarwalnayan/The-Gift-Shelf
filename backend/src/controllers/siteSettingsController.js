import SiteSettings from '../models/SiteSettings.js';

export const getSiteSettings = async (req, res) => {
    try {
        const settings = await SiteSettings.getSingleton();

        res.status(200).json({
            success: true,
            data: settings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateSiteSettings = async (req, res) => {
    try {
        const settings = await SiteSettings.getSingleton();

        Object.assign(settings, req.body);

        if (req.user) {
            settings.updatedBy = req.user._id;
        }

        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Site settings updated successfully.',
            data: settings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};