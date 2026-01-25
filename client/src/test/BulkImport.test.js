import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

describe('Bulk Import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockBulkImport = ({ onImport }) => {
    const [animals, setAnimals] = React.useState([]);
    const [errors, setErrors] = React.useState([]);
    const [result, setResult] = React.useState('');
    const [importing, setImporting] = React.useState(false);

    const handleFile = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        const lines = content.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          setErrors(['CSV must have a header row and at least one data row.']);
          return;
        }
        const headers = lines[0].split(',').map(h => h.toLowerCase().trim());
        const required = ['name', 'type', 'age', 'sex', 'color', 'description'];
        const missing = required.filter(h => !headers.includes(h));
        if (missing.length > 0) {
          setErrors([`Missing required columns: ${missing.join(', ')}`]);
          return;
        }
        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const fields = lines[i].split(',');
          const row = {};
          headers.forEach((h, idx) => { row[h] = fields[idx] || ''; });
          parsed.push({
            name: row.name, type: row.type, breed: row.breed || '',
            age: parseInt(row.age, 10), sex: row.sex, color: row.color,
            description: row.description, image: row.image || '', video: row.video || ''
          });
        }
        setAnimals(parsed);
        setErrors([]);
      };
      reader.readAsText(file);
    };

    return (
      <div data-testid="bulk-import">
        <h3 data-testid="bulk-title">Bulk Import Animals</h3>
        <p data-testid="bulk-instructions">Upload a CSV file with columns: name, type, breed, age, sex, color, description, image, video</p>
        <input data-testid="file-input" type="file" accept=".csv" onChange={handleFile} />

        {errors.length > 0 && (
          <div data-testid="errors-container">
            {errors.map((err, idx) => <p key={idx} data-testid={`error-${idx}`}>{err}</p>)}
          </div>
        )}

        {animals.length > 0 && (
          <div data-testid="preview-section">
            <table data-testid="preview-table">
              <thead>
                <tr>
                  <th>Name</th><th>Type</th><th>Breed</th><th>Age</th><th>Sex</th><th>Color</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((a, idx) => (
                  <tr key={idx} data-testid={`preview-row-${idx}`}>
                    <td data-testid={`preview-name-${idx}`}>{a.name}</td>
                    <td>{a.type}</td><td>{a.breed || '-'}</td>
                    <td>{a.age}</td><td>{a.sex}</td><td>{a.color}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              data-testid="import-btn"
              disabled={importing}
              onClick={() => {
                setImporting(true);
                if (onImport) onImport(animals);
                setResult(`Successfully imported ${animals.length} animals.`);
                setAnimals([]);
                setImporting(false);
              }}
            >
              {importing ? 'Importing...' : `Import ${animals.length} Animals`}
            </button>
            <button data-testid="clear-btn" onClick={() => { setAnimals([]); setErrors([]); setResult(''); }}>
              Clear
            </button>
          </div>
        )}

        {result && <p data-testid="result-message">{result}</p>}
      </div>
    );
  };

  function createFile(content) {
    return new File([content], 'animals.csv', { type: 'text/csv' });
  }

  it('should render title and instructions', () => {
    render(<MemoryRouter><MockBulkImport /></MemoryRouter>);
    expect(screen.getByTestId('bulk-title')).toHaveTextContent('Bulk Import Animals');
    expect(screen.getByTestId('bulk-instructions')).toBeInTheDocument();
  });

  it('should render file input', () => {
    render(<MemoryRouter><MockBulkImport /></MemoryRouter>);
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toHaveAttribute('accept', '.csv');
  });

  it('should not show preview or errors initially', () => {
    render(<MemoryRouter><MockBulkImport /></MemoryRouter>);
    expect(screen.queryByTestId('preview-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('errors-container')).not.toBeInTheDocument();
  });

  it('should show preview table after valid file upload', async () => {
    render(<MemoryRouter><MockBulkImport /></MemoryRouter>);
    const csv = 'name,type,age,sex,color,description\nBuddy,Dog,3,Male,Golden,Friendly';
    const file = createFile(csv);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    await new Promise(r => setTimeout(r, 100));
    expect(screen.getByTestId('preview-section')).toBeInTheDocument();
    expect(screen.getByTestId('preview-name-0')).toHaveTextContent('Buddy');
  });

  it('should show errors for invalid CSV', async () => {
    render(<MemoryRouter><MockBulkImport /></MemoryRouter>);
    const csv = 'wrong,headers\n1,2';
    const file = createFile(csv);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    await new Promise(r => setTimeout(r, 100));
    expect(screen.getByTestId('errors-container')).toBeInTheDocument();
  });

  it('should show import button with count', async () => {
    render(<MemoryRouter><MockBulkImport /></MemoryRouter>);
    const csv = 'name,type,age,sex,color,description\nBuddy,Dog,3,Male,Golden,Friendly\nLuna,Cat,2,Female,Black,Sweet';
    const file = createFile(csv);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    await new Promise(r => setTimeout(r, 100));
    expect(screen.getByTestId('import-btn')).toHaveTextContent('Import 2 Animals');
  });

  it('should call onImport with parsed animals', async () => {
    const handleImport = vi.fn();
    render(<MemoryRouter><MockBulkImport onImport={handleImport} /></MemoryRouter>);
    const csv = 'name,type,age,sex,color,description\nBuddy,Dog,3,Male,Golden,Friendly';
    const file = createFile(csv);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    await new Promise(r => setTimeout(r, 100));
    fireEvent.click(screen.getByTestId('import-btn'));
    expect(handleImport).toHaveBeenCalledWith([expect.objectContaining({ name: 'Buddy', type: 'Dog' })]);
  });

  it('should show success result after import', async () => {
    render(<MemoryRouter><MockBulkImport onImport={vi.fn()} /></MemoryRouter>);
    const csv = 'name,type,age,sex,color,description\nBuddy,Dog,3,Male,Golden,Friendly';
    const file = createFile(csv);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    await new Promise(r => setTimeout(r, 100));
    fireEvent.click(screen.getByTestId('import-btn'));
    expect(screen.getByTestId('result-message')).toHaveTextContent('Successfully imported 1 animals.');
  });

  it('should clear preview when clear is clicked', async () => {
    render(<MemoryRouter><MockBulkImport /></MemoryRouter>);
    const csv = 'name,type,age,sex,color,description\nBuddy,Dog,3,Male,Golden,Friendly';
    const file = createFile(csv);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    await new Promise(r => setTimeout(r, 100));
    fireEvent.click(screen.getByTestId('clear-btn'));
    expect(screen.queryByTestId('preview-section')).not.toBeInTheDocument();
  });

  it('should show multiple rows in preview', async () => {
    render(<MemoryRouter><MockBulkImport /></MemoryRouter>);
    const csv = 'name,type,age,sex,color,description\nBuddy,Dog,3,Male,Golden,Friendly\nLuna,Cat,2,Female,Black,Sweet\nMax,Dog,5,Male,Brown,Active';
    const file = createFile(csv);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    await new Promise(r => setTimeout(r, 100));
    expect(screen.getByTestId('preview-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('preview-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('preview-row-2')).toBeInTheDocument();
  });
});
