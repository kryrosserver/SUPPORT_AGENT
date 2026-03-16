'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'
import { 
  Brain, 
  Plus, 
  Edit, 
  Trash2, 
  MessageCircle, 
  Shield, 
  Package,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
  is_active: boolean
  created_at: string
}

interface Template {
  id: number
  title: string
  trigger_keywords: string
  response: string
  category: string
  is_active: boolean
  created_at: string
}

interface Filter {
  id: number
  keyword: string
  filter_type: string
  response_message: string
  is_active: boolean
  created_at: string
}

interface Product {
  id: number
  title: string
  description: string
  category: string
  price: string
  is_active: boolean
  created_at: string
}

interface Session {
  id: number
  name: string
  email: string
  role: string
}

export default function AIControlPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Data states
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [filters, setFilters] = useState<Filter[]>([])
  const [products, setProducts] = useState<Product[]>([])
  
  // Dialog states
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  
  // Form states
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form data
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General' })
  const [templateForm, setTemplateForm] = useState({ title: '', triggerKeywords: '', response: '', category: 'General' })
  const [filterForm, setFilterForm] = useState({ keyword: '', filterType: 'block', responseMessage: '' })
  const [productForm, setProductForm] = useState({ title: '', description: '', category: 'General', price: '' })

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (!data.user || (data.user.role !== 'super_admin' && data.user.role !== 'admin')) {
        router.push('/dashboard')
        return
      }
      
      setSession(data.user)
      fetchData()
    } catch (error) {
      console.error('Failed to check session:', error)
      router.push('/login')
    }
  }

  const fetchData = async () => {
    try {
      const [faqsRes, templatesRes, filtersRes, productsRes] = await Promise.all([
        fetch('/api/ai-control?type=faqs'),
        fetch('/api/ai-control?type=templates'),
        fetch('/api/ai-control?type=filters'),
        fetch('/api/ai-control?type=products'),
      ])

      const faqsData = await faqsRes.json()
      const templatesData = await templatesRes.json()
      const filtersData = await filtersRes.json()
      const productsData = await productsRes.json()

      // Handle cases where tables might not exist
      setFaqs(Array.isArray(faqsData) ? faqsData : [])
      setTemplates(Array.isArray(templatesData) ? templatesData : [])
      setFilters(Array.isArray(filtersData) ? filtersData : [])
      setProducts(Array.isArray(productsData) ? productsData : [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Set empty arrays on error
      setFaqs([])
      setTemplates([])
      setFilters([])
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle active status
  const toggleActive = async (type: string, id: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/ai-control/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })
      fetchData()
    } catch (error) {
      console.error('Failed to toggle:', error)
    }
  }

  // Delete item
  const deleteItem = async (type: string, id: number) => {
    try {
      await fetch(`/api/ai-control/${type}/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  // Save FAQ
  const saveFaq = async () => {
    try {
      if (editingFaq) {
        await fetch(`/api/ai-control/faq/${editingFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(faqForm)
        })
      } else {
        await fetch('/api/ai-control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'faq', data: faqForm })
        })
      }
      setIsFaqDialogOpen(false)
      setEditingFaq(null)
      setFaqForm({ question: '', answer: '', category: 'General' })
      fetchData()
    } catch (error) {
      console.error('Failed to save FAQ:', error)
    }
  }

  // Save Template
  const saveTemplate = async () => {
    try {
      if (editingTemplate) {
        await fetch(`/api/ai-control/template/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: templateForm.title,
            trigger_keywords: templateForm.triggerKeywords,
            response: templateForm.response,
            category: templateForm.category
          })
        })
      } else {
        await fetch('/api/ai-control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'template', data: templateForm })
        })
      }
      setIsTemplateDialogOpen(false)
      setEditingTemplate(null)
      setTemplateForm({ title: '', triggerKeywords: '', response: '', category: 'General' })
      fetchData()
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }

  // Save Filter
  const saveFilter = async () => {
    try {
      if (editingFilter) {
        await fetch(`/api/ai-control/filter/${editingFilter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filterForm)
        })
      } else {
        await fetch('/api/ai-control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'filter', data: filterForm })
        })
      }
      setIsFilterDialogOpen(false)
      setEditingFilter(null)
      setFilterForm({ keyword: '', filterType: 'block', responseMessage: '' })
      fetchData()
    } catch (error) {
      console.error('Failed to save filter:', error)
    }
  }

  // Save Product
  const saveProduct = async () => {
    try {
      if (editingProduct) {
        await fetch(`/api/ai-control/product/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm)
        })
      } else {
        await fetch('/api/ai-control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'product', data: productForm })
        })
      }
      setIsProductDialogOpen(false)
      setEditingProduct(null)
      setProductForm({ title: '', description: '', category: 'General', price: '' })
      fetchData()
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const openEditFaq = (faq: FAQ) => {
    setEditingFaq(faq)
    setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category })
    setIsFaqDialogOpen(true)
  }

  const openEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setTemplateForm({ 
      title: template.title, 
      triggerKeywords: template.trigger_keywords, 
      response: template.response, 
      category: template.category 
    })
    setIsTemplateDialogOpen(true)
  }

  const openEditFilter = (filter: Filter) => {
    setEditingFilter(filter)
    setFilterForm({ 
      keyword: filter.keyword, 
      filterType: filter.filter_type, 
      responseMessage: filter.response_message || '' 
    })
    setIsFilterDialogOpen(true)
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({ 
      title: product.title, 
      description: product.description, 
      category: product.category, 
      price: product.price || '' 
    })
    setIsProductDialogOpen(true)
  }

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 
          className="text-2xl font-bold flex items-center gap-3"
          style={{ color: '#111827' }}
        >
          <Brain className="h-7 w-7" style={{ color: '#22C55E' }} />
          AI Control
        </h1>
        <p 
          className="mt-1 text-sm"
          style={{ color: '#6B7280' }}
        >
          Manage what the AI says and how it responds to customers
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="mb-6 bg-white p-1 rounded-lg" style={{ border: '1px solid #E5E7EB' }}>
          <TabsTrigger 
            value="faqs"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            style={{ borderRadius: '6px' }}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQs ({faqs.length})
          </TabsTrigger>
          <TabsTrigger 
            value="templates"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            style={{ borderRadius: '6px' }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger 
            value="filters"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            style={{ borderRadius: '6px' }}
          >
            <Shield className="w-4 h-4 mr-2" />
            Filters ({filters.length})
          </TabsTrigger>
          <TabsTrigger 
            value="products"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            style={{ borderRadius: '6px' }}
          >
            <Package className="w-4 h-4 mr-2" />
            Products ({products.length})
          </TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Frequently Asked Questions</h2>
              <Button
                onClick={() => { setEditingFaq(null); setFaqForm({ question: '', answer: '', category: 'General' }); setIsFaqDialogOpen(true) }}
                style={{ backgroundColor: '#22C55E', color: 'white', borderRadius: '8px' }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add FAQ
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#F9FAFB' }}>
                  <TableHead className="font-semibold">Question</TableHead>
                  <TableHead className="font-semibold">Answer</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq) => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium">{faq.question}</TableCell>
                    <TableCell className="max-w-xs truncate">{faq.answer}</TableCell>
                    <TableCell>{faq.category}</TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive('faq', faq.id, faq.is_active)}>
                        {faq.is_active 
                          ? <ToggleRight className="w-6 h-6 text-green-500" />
                          : <ToggleLeft className="w-6 h-6 text-gray-400" />
                        }
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditFaq(faq)}>
                          <Edit className="w-4 h-4" style={{ color: '#3B82F6' }} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteItem('faq', faq.id)} style={{ backgroundColor: '#DC2626', color: 'white' }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Response Templates</h2>
              <Button
                onClick={() => { setEditingTemplate(null); setTemplateForm({ title: '', triggerKeywords: '', response: '', category: 'General' }); setIsTemplateDialogOpen(true) }}
                style={{ backgroundColor: '#22C55E', color: 'white', borderRadius: '8px' }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Template
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#F9FAFB' }}>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Trigger Keywords</TableHead>
                  <TableHead className="font-semibold">Response</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.title}</TableCell>
                    <TableCell>{template.trigger_keywords}</TableCell>
                    <TableCell className="max-w-xs truncate">{template.response}</TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive('template', template.id, template.is_active)}>
                        {template.is_active 
                          ? <ToggleRight className="w-6 h-6 text-green-500" />
                          : <ToggleLeft className="w-6 h-6 text-gray-400" />
                        }
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditTemplate(template)}>
                          <Edit className="w-4 h-4" style={{ color: '#3B82F6' }} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteItem('template', template.id)} style={{ backgroundColor: '#DC2626', color: 'white' }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Filters Tab */}
        <TabsContent value="filters">
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Content Filters</h2>
              <Button
                onClick={() => { setEditingFilter(null); setFilterForm({ keyword: '', filterType: 'block', responseMessage: '' }); setIsFilterDialogOpen(true) }}
                style={{ backgroundColor: '#22C55E', color: 'white', borderRadius: '8px' }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Filter
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#F9FAFB' }}>
                  <TableHead className="font-semibold">Keyword</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Response Message</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filters.map((filter) => (
                  <TableRow key={filter.id}>
                    <TableCell className="font-medium">{filter.keyword}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        filter.filter_type === 'block' ? 'bg-red-100 text-red-700' :
                        filter.filter_type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {filter.filter_type}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{filter.response_message}</TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive('filter', filter.id, filter.is_active)}>
                        {filter.is_active 
                          ? <ToggleRight className="w-6 h-6 text-green-500" />
                          : <ToggleLeft className="w-6 h-6 text-gray-400" />
                        }
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditFilter(filter)}>
                          <Edit className="w-4 h-4" style={{ color: '#3B82F6' }} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Filter?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteItem('filter', filter.id)} style={{ backgroundColor: '#DC2626', color: 'white' }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Product Information</h2>
              <Button
                onClick={() => { setEditingProduct(null); setProductForm({ title: '', description: '', category: 'General', price: '' }); setIsProductDialogOpen(true) }}
                style={{ backgroundColor: '#22C55E', color: 'white', borderRadius: '8px' }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#F9FAFB' }}>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive('product', product.id, product.is_active)}>
                        {product.is_active 
                          ? <ToggleRight className="w-6 h-6 text-green-500" />
                          : <ToggleLeft className="w-6 h-6 text-gray-400" />
                        }
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditProduct(product)}>
                          <Edit className="w-4 h-4" style={{ color: '#3B82F6' }} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteItem('product', product.id)} style={{ backgroundColor: '#DC2626', color: 'white' }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* FAQ Dialog */}
      <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Question</label>
              <Input 
                value={faqForm.question} 
                onChange={(e) => setFaqForm({...faqForm, question: e.target.value})}
                placeholder="What is your return policy?"
                style={{ height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Answer</label>
              <Textarea 
                value={faqForm.answer} 
                onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})}
                placeholder="We offer a 30-day return policy..."
                rows={3}
                style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Input 
                value={faqForm.category} 
                onChange={(e) => setFaqForm({...faqForm, category: e.target.value})}
                placeholder="General"
                style={{ height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsFaqDialogOpen(false)} className="flex-1" style={{ borderRadius: '8px', height: '42px' }}>Cancel</Button>
              <Button onClick={saveFaq} className="flex-1" style={{ backgroundColor: '#22C55E', color: 'white', borderRadius: '8px', height: '42px' }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Add Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input 
                value={templateForm.title} 
                onChange={(e) => setTemplateForm({...templateForm, title: e.target.value})}
                placeholder="Greeting"
                style={{ height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Trigger Keywords (comma-separated)</label>
              <Input 
                value={templateForm.triggerKeywords} 
                onChange={(e) => setTemplateForm({...templateForm, triggerKeywords: e.target.value})}
                placeholder="hello,hi,hey"
                style={{ height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Response</label>
              <Textarea 
                value={templateForm.response} 
                onChange={(e) => setTemplateForm({...templateForm, response: e.target.value})}
                placeholder="Hello! How can I help you?"
                rows={3}
                style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Input 
                value={templateForm.category} 
                onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                placeholder="General"
                style={{ height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)} className="flex-1" style={{ borderRadius: '8px', height: '42px' }}>Cancel</Button>
              <Button onClick={saveTemplate} className="flex-1" style={{ backgroundColor: '#22C55E', color: 'white', borderRadius: '8px', height: '42px' }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFilter ? 'Edit Filter' : 'Add Filter'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Keyword to Block</label>
              <Input 
                value={filterForm.keyword} 
                onChange={(e) => setFilterForm({...filterForm, keyword: e.target.value})}
                placeholder="refund"
                style={{ height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter Type</label>
              <select 
                value={filterForm.filterType}
                onChange={(e) => setFilterForm({...filterForm, filterType: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              >
                <option value="block">Block - Don't respond</option>
                <option value="warning">Warning - Show warning message</option>
                <option value="escalate">Escalate - Connect to human</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Response Message</label>
              <Textarea 
                value={filterForm.responseMessage} 
                onChange={(e) => setFilterForm({...filterForm, responseMessage: e.target.value})}
                placeholder="I'll connect you with a human agent..."
                rows={3}
                style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsFilterDialogOpen(false)} className="flex-1" style={{ borderRadius: '8px', height: '42px' }}>Cancel</Button>
              <Button onClick={saveFilter} className="flex-1" style={{ backgroundColor: '#22C55E', color: 'white', borderRadius: '8px', height: '42px' }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input 
                value={productForm.title} 
                onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                placeholder="KRYROS Basic Plan"
                style={{ height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea 
                value={productForm.description} 
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Entry-level support package..."
                rows={3}
                style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Input 
                value={productForm.category} 
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                placeholder="Plans"
                style={{ height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Price</label>
              <Input 
                value={productForm.price} 
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                placeholder="$29/month"
                style={{ height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsProductDialogOpen(false)} className="flex-1" style={{ borderRadius: '8px', height: '42px' }}>Cancel</Button>
              <Button onClick={saveProduct} className="flex-1" style={{ backgroundColor: '#22C55E', color: 'white', borderRadius: '8px', height: '42px' }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
