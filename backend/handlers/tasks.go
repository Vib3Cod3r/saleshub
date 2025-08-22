package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saleshub-backend/config"
	"saleshub-backend/models"
)

// GetTasks returns a list of tasks
func GetTasks(c *gin.Context) {
	var tasks []models.Task
	tenantID := c.GetString("tenantID")

	query := config.DB.Where("tenant_id = ?", tenantID)

	// Preload relationships
	query = query.Preload("Type").
		Preload("AssignedUser").
		Preload("CreatedByUser").
		Preload("Lead").
		Preload("Deal")

	// Add pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Add search
	if search := c.Query("search"); search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Add overdue filter
	if overdue := c.Query("overdue"); overdue == "true" {
		query = query.Where("due_date < NOW() AND status != 'COMPLETED'")
	}

	// Add due today filter
	if dueToday := c.Query("dueToday"); dueToday == "true" {
		query = query.Where("DATE(due_date) = CURRENT_DATE")
	}

	// Add upcoming filter
	if upcoming := c.Query("upcoming"); upcoming == "true" {
		query = query.Where("due_date > NOW()")
	}

	// Add assignee filter
	if assigneeId := c.Query("assigneeId"); assigneeId != "" {
		query = query.Where("assigned_user_id = ?", assigneeId)
	}

	// Get total count for pagination
	var total int64
	if err := config.DB.Model(&models.Task{}).Where("tenant_id = ?", tenantID).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count tasks"})
		return
	}

	if err := query.Offset(offset).Limit(limit).Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks"})
		return
	}

	// Calculate total pages
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	// Transform tasks to response format
	var taskResponses []gin.H
	for _, task := range tasks {
		taskData := gin.H{
			"id":             task.ID,
			"title":          task.Title,
			"description":    task.Description,
			"typeId":         task.TypeID,
			"type":           task.Type,
			"priority":       task.Priority,
			"status":         task.Status,
			"dueDate":        task.DueDate,
			"completedAt":    task.CompletedAt,
			"assignedUserId": task.AssignedUserID,
			"assignedUser":   task.AssignedUser,
			"createdBy":      task.CreatedBy,
			"createdByUser":  task.CreatedByUser,
			"leadId":         task.LeadID,
			"lead":           task.Lead,
			"dealId":         task.DealID,
			"deal":           task.Deal,
			"tenantId":       task.TenantID,
			"createdAt":      task.CreatedAt,
			"updatedAt":      task.UpdatedAt,
		}
		taskResponses = append(taskResponses, taskData)
	}

	c.JSON(http.StatusOK, gin.H{
		"data": taskResponses,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": totalPages,
		},
	})
}

// CreateTask creates a new task
func CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task.TenantID = c.GetString("tenantID")
	userID := c.GetString("userID")
	task.CreatedBy = userID

	if err := config.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create task"})
		return
	}

	c.JSON(http.StatusCreated, task)
}

// GetTask returns a single task
func GetTask(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var task models.Task
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&task).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch task"})
		return
	}

	c.JSON(http.StatusOK, task)
}

// UpdateTask updates a task
func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var task models.Task
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&task).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch task"})
		return
	}

	var updateData models.Task
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Model(&task).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update task"})
		return
	}

	c.JSON(http.StatusOK, task)
}

// DeleteTask deletes a task
func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var task models.Task
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&task).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch task"})
		return
	}

	if err := config.DB.Delete(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}
