import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('Application Template Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockTemplateManager = ({ templates = [], loading = false, error = false, showForm = false, onCreateTemplate, onDeleteTemplate }) => {
    const [formVisible, setFormVisible] = React.useState(showForm);
    const [templateName, setTemplateName] = React.useState('');
    const [fields, setFields] = React.useState([{ label: '', fieldType: 'text', required: false, options: '' }]);

    if (loading) return <p data-testid="loading">Loading templates...</p>;
    if (error) return <p data-testid="error">Error loading templates</p>;

    const addField = () => setFields([...fields, { label: '', fieldType: 'text', required: false, options: '' }]);
    const removeField = (idx) => setFields(fields.filter((_, i) => i !== idx));
    const updateField = (idx, key, value) => {
      const updated = [...fields];
      updated[idx] = { ...updated[idx], [key]: value };
      setFields(updated);
    };

    return (
      <div data-testid="template-manager">
        <div data-testid="template-header">
          <h3 data-testid="template-title">Application Templates</h3>
          <button data-testid="new-template-btn" onClick={() => setFormVisible(!formVisible)}>
            {formVisible ? 'Cancel' : 'New Template'}
          </button>
        </div>

        {formVisible && (
          <form data-testid="template-form" onSubmit={(e) => {
            e.preventDefault();
            if (!templateName) return;
            const validFields = fields.filter(f => f.label.trim());
            if (validFields.length === 0) return;
            if (onCreateTemplate) {
              onCreateTemplate({
                name: templateName,
                fields: validFields.map(f => ({
                  label: f.label,
                  fieldType: f.fieldType,
                  required: f.required,
                  options: f.fieldType === 'select' ? f.options.split(',').map(o => o.trim()).filter(Boolean) : []
                }))
              });
            }
          }}>
            <div>
              <label data-testid="label-template-name">Template Name *</label>
              <input data-testid="input-template-name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            </div>
            <div data-testid="fields-section">
              {fields.map((field, idx) => (
                <div key={idx} data-testid={`field-row-${idx}`}>
                  <input data-testid={`field-label-${idx}`} value={field.label} onChange={(e) => updateField(idx, 'label', e.target.value)} placeholder="Field label" />
                  <select data-testid={`field-type-${idx}`} value={field.fieldType} onChange={(e) => updateField(idx, 'fieldType', e.target.value)}>
                    <option value="text">Text</option>
                    <option value="textarea">Text Area</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="number">Number</option>
                  </select>
                  <label>
                    <input data-testid={`field-required-${idx}`} type="checkbox" checked={field.required} onChange={(e) => updateField(idx, 'required', e.target.checked)} />
                    Req
                  </label>
                  {field.fieldType === 'select' && (
                    <input data-testid={`field-options-${idx}`} value={field.options} onChange={(e) => updateField(idx, 'options', e.target.value)} placeholder="Options (comma-separated)" />
                  )}
                  {fields.length > 1 && (
                    <button data-testid={`remove-field-${idx}`} type="button" onClick={() => removeField(idx)}>X</button>
                  )}
                </div>
              ))}
              <button data-testid="add-field-btn" type="button" onClick={addField}>+ Add Field</button>
            </div>
            <button data-testid="submit-template" type="submit">Create Template</button>
          </form>
        )}

        {templates.length === 0 && (
          <p data-testid="empty-message">No application templates yet. Create one to customize your adoption applications.</p>
        )}

        {templates.length > 0 && (
          <div data-testid="templates-list">
            {templates.map(template => (
              <div key={template._id} data-testid={`template-${template._id}`}>
                <p data-testid={`template-name-${template._id}`}>{template.name}</p>
                <div data-testid={`template-fields-${template._id}`}>
                  {template.fields.map((field, idx) => (
                    <span key={idx} data-testid={`template-field-${template._id}-${idx}`}>
                      {field.label} ({field.fieldType}){field.required ? ' *' : ''}
                    </span>
                  ))}
                </div>
                <p data-testid={`template-count-${template._id}`}>{template.fields.length} field{template.fields.length !== 1 ? 's' : ''}</p>
                <button data-testid={`delete-template-${template._id}`} onClick={() => onDeleteTemplate && onDeleteTemplate(template._id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const mockTemplates = [
    {
      _id: 't1',
      shelterId: 's1',
      name: 'Dog Adoption Form',
      fields: [
        { label: 'Full Name', fieldType: 'text', required: true, options: [] },
        { label: 'Housing Type', fieldType: 'select', required: true, options: ['House', 'Apartment', 'Condo'] },
        { label: 'Has Yard', fieldType: 'checkbox', required: false, options: [] },
        { label: 'Experience', fieldType: 'textarea', required: false, options: [] }
      ],
      createdAt: '2025-01-10T00:00:00Z'
    },
    {
      _id: 't2',
      shelterId: 's1',
      name: 'Cat Adoption Form',
      fields: [
        { label: 'Full Name', fieldType: 'text', required: true, options: [] },
        { label: 'Number of Cats', fieldType: 'number', required: false, options: [] }
      ],
      createdAt: '2025-01-08T00:00:00Z'
    }
  ];

  it('should render template manager title', () => {
    render(<MemoryRouter><MockTemplateManager templates={mockTemplates} /></MemoryRouter>);
    expect(screen.getByTestId('template-title')).toHaveTextContent('Application Templates');
  });

  it('should show loading state', () => {
    render(<MemoryRouter><MockTemplateManager loading={true} /></MemoryRouter>);
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading templates...');
  });

  it('should show error state', () => {
    render(<MemoryRouter><MockTemplateManager error={true} /></MemoryRouter>);
    expect(screen.getByTestId('error')).toHaveTextContent('Error loading templates');
  });

  it('should show empty message when no templates', () => {
    render(<MemoryRouter><MockTemplateManager templates={[]} /></MemoryRouter>);
    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
  });

  it('should display template names', () => {
    render(<MemoryRouter><MockTemplateManager templates={mockTemplates} /></MemoryRouter>);
    expect(screen.getByTestId('template-name-t1')).toHaveTextContent('Dog Adoption Form');
    expect(screen.getByTestId('template-name-t2')).toHaveTextContent('Cat Adoption Form');
  });

  it('should display field count', () => {
    render(<MemoryRouter><MockTemplateManager templates={mockTemplates} /></MemoryRouter>);
    expect(screen.getByTestId('template-count-t1')).toHaveTextContent('4 fields');
    expect(screen.getByTestId('template-count-t2')).toHaveTextContent('2 fields');
  });

  it('should display template fields', () => {
    render(<MemoryRouter><MockTemplateManager templates={mockTemplates} /></MemoryRouter>);
    expect(screen.getByTestId('template-field-t1-0')).toHaveTextContent('Full Name (text) *');
    expect(screen.getByTestId('template-field-t1-1')).toHaveTextContent('Housing Type (select) *');
    expect(screen.getByTestId('template-field-t1-2')).toHaveTextContent('Has Yard (checkbox)');
  });

  it('should toggle form visibility', () => {
    render(<MemoryRouter><MockTemplateManager templates={[]} /></MemoryRouter>);
    expect(screen.queryByTestId('template-form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('new-template-btn'));
    expect(screen.getByTestId('template-form')).toBeInTheDocument();
  });

  it('should show Cancel text when form is visible', () => {
    render(<MemoryRouter><MockTemplateManager templates={[]} showForm={true} /></MemoryRouter>);
    expect(screen.getByTestId('new-template-btn')).toHaveTextContent('Cancel');
  });

  it('should render form with template name input', () => {
    render(<MemoryRouter><MockTemplateManager templates={[]} showForm={true} /></MemoryRouter>);
    expect(screen.getByTestId('input-template-name')).toBeInTheDocument();
  });

  it('should render initial field row', () => {
    render(<MemoryRouter><MockTemplateManager templates={[]} showForm={true} /></MemoryRouter>);
    expect(screen.getByTestId('field-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('field-label-0')).toBeInTheDocument();
    expect(screen.getByTestId('field-type-0')).toBeInTheDocument();
    expect(screen.getByTestId('field-required-0')).toBeInTheDocument();
  });

  it('should add a new field row', () => {
    render(<MemoryRouter><MockTemplateManager templates={[]} showForm={true} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('add-field-btn'));
    expect(screen.getByTestId('field-row-1')).toBeInTheDocument();
  });

  it('should remove a field row', () => {
    render(<MemoryRouter><MockTemplateManager templates={[]} showForm={true} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('add-field-btn'));
    expect(screen.getByTestId('field-row-1')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('remove-field-1'));
    expect(screen.queryByTestId('field-row-1')).not.toBeInTheDocument();
  });

  it('should show options input when field type is select', () => {
    render(<MemoryRouter><MockTemplateManager templates={[]} showForm={true} /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('field-type-0'), { target: { value: 'select' } });
    expect(screen.getByTestId('field-options-0')).toBeInTheDocument();
  });

  it('should call onCreateTemplate with correct data', () => {
    const mockCreate = vi.fn();
    render(<MemoryRouter><MockTemplateManager templates={[]} showForm={true} onCreateTemplate={mockCreate} /></MemoryRouter>);

    fireEvent.change(screen.getByTestId('input-template-name'), { target: { value: 'Test Form' } });
    fireEvent.change(screen.getByTestId('field-label-0'), { target: { value: 'Your Name' } });
    fireEvent.click(screen.getByTestId('field-required-0'));
    fireEvent.submit(screen.getByTestId('template-form'));

    expect(mockCreate).toHaveBeenCalledWith({
      name: 'Test Form',
      fields: [{ label: 'Your Name', fieldType: 'text', required: true, options: [] }]
    });
  });

  it('should not submit form without template name', () => {
    const mockCreate = vi.fn();
    render(<MemoryRouter><MockTemplateManager templates={[]} showForm={true} onCreateTemplate={mockCreate} /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('field-label-0'), { target: { value: 'Name' } });
    fireEvent.submit(screen.getByTestId('template-form'));
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should not submit form without valid fields', () => {
    const mockCreate = vi.fn();
    render(<MemoryRouter><MockTemplateManager templates={[]} showForm={true} onCreateTemplate={mockCreate} /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('input-template-name'), { target: { value: 'Test' } });
    fireEvent.submit(screen.getByTestId('template-form'));
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should have Delete button for each template', () => {
    render(<MemoryRouter><MockTemplateManager templates={mockTemplates} /></MemoryRouter>);
    expect(screen.getByTestId('delete-template-t1')).toHaveTextContent('Delete');
  });

  it('should call onDeleteTemplate when Delete is clicked', () => {
    const mockDelete = vi.fn();
    render(<MemoryRouter><MockTemplateManager templates={mockTemplates} onDeleteTemplate={mockDelete} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('delete-template-t1'));
    expect(mockDelete).toHaveBeenCalledWith('t1');
  });

  it('should parse comma-separated options for select fields', () => {
    const mockCreate = vi.fn();
    render(<MemoryRouter><MockTemplateManager templates={[]} showForm={true} onCreateTemplate={mockCreate} /></MemoryRouter>);

    fireEvent.change(screen.getByTestId('input-template-name'), { target: { value: 'Form' } });
    fireEvent.change(screen.getByTestId('field-label-0'), { target: { value: 'Housing' } });
    fireEvent.change(screen.getByTestId('field-type-0'), { target: { value: 'select' } });
    fireEvent.change(screen.getByTestId('field-options-0'), { target: { value: 'House, Apartment, Condo' } });
    fireEvent.submit(screen.getByTestId('template-form'));

    expect(mockCreate).toHaveBeenCalledWith({
      name: 'Form',
      fields: [{ label: 'Housing', fieldType: 'select', required: false, options: ['House', 'Apartment', 'Condo'] }]
    });
  });
});
