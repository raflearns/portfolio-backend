const pool = require('../config/db');

// @desc    Fetch all portfolio projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
    try {
        // In a full enterprise app, this query would sit in a separate 'services' file
        const [projects] = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
        
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error occurred while fetching data'
        });
    }
};