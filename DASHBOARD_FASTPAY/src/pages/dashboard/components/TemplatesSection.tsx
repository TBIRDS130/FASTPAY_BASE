import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/component/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/ui/card'
import { Button } from '@/component/ui/button'
import { Input } from '@/component/ui/input'
import { Label } from '@/component/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/select'
import { Badge } from '@/component/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/component/ui/table'
import { Plus, Edit, Eye, Copy, Trash2, Save, X } from 'lucide-react'
import { toast } from '@/lib/use-toast'
import { cn } from '@/lib/utils'

interface BankCardTemplate {
  id: number
  template_code: string
  template_name: string
  bank_name?: string
  card_type: 'credit' | 'debit' | 'prepaid'
  description?: string
  field_schema?: Record<string, any>
  validation_rules?: Record<string, any>
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

interface TemplateFormData {
  template_code: string
  template_name: string
  bank_name?: string
  card_type: 'credit' | 'debit' | 'prepaid'
  description?: string
  field_schema?: Record<string, any>
  validation_rules?: Record<string, any>
}

export function TemplatesSection() {
  const [activeTab, setActiveTab] = useState<'view' | 'create' | 'edit'>('view')
  const [templates, setTemplates] = useState<BankCardTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<BankCardTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TemplateFormData>({
    template_code: '',
    template_name: '',
    bank_name: '',
    card_type: 'debit',
    description: '',
    field_schema: {},
    validation_rules: {}
  })

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bank-card-templates/')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.results || data)
      } else {
        throw new Error('Failed to fetch templates')
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch templates',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bank-card-templates/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Template created successfully',
        })
        setActiveTab('view')
        fetchTemplates()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create template')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create template',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateTemplate = async () => {
    if (!selectedTemplate) return

    setLoading(true)
    try {
      const response = await fetch(`/api/bank-card-templates/${selectedTemplate.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Template updated successfully',
        })
        setActiveTab('view')
        fetchTemplates()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update template')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update template',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/bank-card-templates/${templateId}/`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
        })
        fetchTemplates()
      } else {
        throw new Error('Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      })
    }
  }

  const duplicateTemplate = async (template: BankCardTemplate) => {
    try {
      const response = await fetch(`/api/bank-card-templates/${template.id}/duplicate/`, {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Template duplicated successfully',
        })
        fetchTemplates()
      } else {
        throw new Error('Failed to duplicate template')
      }
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        variant: 'destructive'
      })
    }
  }

  const previewTemplate = async (template: BankCardTemplate) => {
    try {
      const response = await fetch(`/api/bank-card-templates/${template.id}/preview/`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Template Preview',
          description: `Preview data: ${JSON.stringify(data.preview, null, 2)}`,
        })
      } else {
        throw new Error('Failed to generate preview')
      }
    } catch (error) {
      console.error('Error previewing template:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate preview',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      template_code: '',
      template_name: '',
      bank_name: '',
      card_type: 'debit',
      description: '',
      field_schema: {},
      validation_rules: {}
    })
    setSelectedTemplate(null)
  }

  const handleEdit = (template: BankCardTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      template_code: template.template_code,
      template_name: template.template_name,
      bank_name: template.bank_name || '',
      card_type: template.card_type,
      description: template.description || '',
      field_schema: template.field_schema || {},
      validation_rules: template.validation_rules || {}
    })
    setActiveTab('edit')
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bank Card Templates</h2>
        <Button onClick={() => setActiveTab('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="view">View Templates</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="edit">Edit Template</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Template List</CardTitle>
              <CardDescription>
                Manage your bank card templates. View, edit, duplicate, or delete existing templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No templates found</p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Template
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-mono">{template.template_code}</TableCell>
                        <TableCell>{template.template_name}</TableCell>
                        <TableCell>{template.bank_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={cn(
                            template.card_type === 'credit' ? 'default' :
                            template.card_type === 'debit' ? 'secondary' : 'outline'
                          )}>
                            {template.card_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {template.is_active && <Badge variant="default">Active</Badge>}
                            {template.is_default && <Badge variant="secondary">Default</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => previewTemplate(template)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => duplicateTemplate(template)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Template</CardTitle>
              <CardDescription>
                Create a new bank card template with custom fields and validation rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template_code">Template Code</Label>
                  <Input
                    id="template_code"
                    value={formData.template_code}
                    onChange={(e) => setFormData({ ...formData, template_code: e.target.value })}
                    placeholder="e.g., AXIS.DEBIT"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="template_name">Template Name</Label>
                  <Input
                    id="template_name"
                    value={formData.template_name}
                    onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                    placeholder="e.g., Axis Bank Debit Card"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="e.g., Axis Bank"
                  />
                </div>
                <div>
                  <Label htmlFor="card_type">Card Type</Label>
                  <Select value={formData.card_type} onValueChange={(v) => setFormData({ ...formData, card_type: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="debit">Debit Card</SelectItem>
                      <SelectItem value="prepaid">Prepaid Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Template description"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={createTemplate} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('view')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Template</CardTitle>
              <CardDescription>
                Edit an existing bank card template. Changes will be saved immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedTemplate ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No template selected for editing</p>
                  <Button onClick={() => setActiveTab('view')}>
                    Select Template to Edit
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_template_code">Template Code</Label>
                      <Input
                        id="edit_template_code"
                        value={formData.template_code}
                        onChange={(e) => setFormData({ ...formData, template_code: e.target.value })}
                        placeholder="e.g., AXIS.DEBIT"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_template_name">Template Name</Label>
                      <Input
                        id="edit_template_name"
                        value={formData.template_name}
                        onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                        placeholder="e.g., Axis Bank Debit Card"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_bank_name">Bank Name</Label>
                      <Input
                        id="edit_bank_name"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        placeholder="e.g., Axis Bank"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_card_type">Card Type</Label>
                      <Select value={formData.card_type} onValueChange={(v) => setFormData({ ...formData, card_type: v as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="debit">Debit Card</SelectItem>
                          <SelectItem value="prepaid">Prepaid Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit_description">Description</Label>
                    <Input
                      id="edit_description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Template description"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={updateTemplate} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      Update Template
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('view')}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
