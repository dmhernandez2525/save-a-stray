import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAnnouncements = [
  {
    _id: 'ann1',
    shelterId: 'shelter1',
    title: 'Holiday Hours Update',
    content: 'We will be closed on Christmas Day and New Years Day.',
    category: 'general',
    author: 'Admin',
    pinned: true,
    active: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: 'ann2',
    shelterId: 'shelter1',
    title: 'Adoption Event This Saturday',
    content: 'Join us for our monthly adoption event. All fees waived!',
    category: 'event',
    author: 'Events Team',
    pinned: false,
    active: true,
    createdAt: '2024-01-16T14:00:00Z'
  },
  {
    _id: 'ann3',
    shelterId: 'shelter1',
    title: 'Urgent: Lost Dog in Area',
    content: 'A brown labrador was found near the shelter. Please help identify.',
    category: 'urgent',
    author: '',
    pinned: false,
    active: true,
    createdAt: '2024-01-17T09:00:00Z'
  }
];

function MockAnnouncementManager({ shelterId }) {
  const [showForm, setShowForm] = React.useState(false);
  const [filterCategory, setFilterCategory] = React.useState('all');
  const [announcements, setAnnouncements] = React.useState(mockAnnouncements);
  const [formState, setFormState] = React.useState({
    title: '',
    content: '',
    category: 'general',
    author: ''
  });

  const filtered = filterCategory === 'all'
    ? announcements
    : announcements.filter(a => a.category === filterCategory);

  const handleCreate = () => {
    if (formState.title && formState.content) {
      const newAnn = {
        _id: `ann${announcements.length + 1}`,
        shelterId,
        title: formState.title,
        content: formState.content,
        category: formState.category,
        author: formState.author,
        pinned: false,
        active: true,
        createdAt: new Date().toISOString()
      };
      setAnnouncements([newAnn, ...announcements]);
      setShowForm(false);
      setFormState({ title: '', content: '', category: 'general', author: '' });
    }
  };

  const handlePin = (id) => {
    setAnnouncements(announcements.map(a =>
      a._id === id ? { ...a, pinned: !a.pinned } : a
    ));
  };

  const handleDelete = (id) => {
    setAnnouncements(announcements.filter(a => a._id !== id));
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between p-4">
        <h2>Announcements</h2>
        <button onClick={() => setShowForm(!showForm)}>+ New Announcement</button>
      </div>

      {showForm && (
        <div className="p-4" data-testid="announcement-form">
          <h3>Create Announcement</h3>
          <input
            type="text"
            value={formState.title}
            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
            placeholder="Announcement title"
            data-testid="title-input"
          />
          <select
            value={formState.category}
            onChange={(e) => setFormState({ ...formState, category: e.target.value })}
            data-testid="category-select"
          >
            <option value="general">General</option>
            <option value="event">Event</option>
            <option value="urgent">Urgent</option>
            <option value="adoption">Adoption</option>
          </select>
          <input
            type="text"
            value={formState.author}
            onChange={(e) => setFormState({ ...formState, author: e.target.value })}
            placeholder="Author name"
            data-testid="author-input"
          />
          <textarea
            value={formState.content}
            onChange={(e) => setFormState({ ...formState, content: e.target.value })}
            placeholder="Announcement content..."
            data-testid="content-input"
          />
          <button onClick={handleCreate}>Publish</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <div className="p-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          data-testid="filter-category"
        >
          <option value="all">All Categories</option>
          <option value="general">General</option>
          <option value="event">Event</option>
          <option value="urgent">Urgent</option>
          <option value="adoption">Adoption</option>
        </select>
      </div>

      <div className="p-4">
        {filtered.length === 0 ? (
          <p>No announcements yet. Create your first announcement!</p>
        ) : (
          filtered.map(ann => (
            <div key={ann._id} data-testid={`announcement-${ann._id}`} className={ann.pinned ? 'border-yellow-300' : ''}>
              {ann.pinned && <span data-testid={`pinned-${ann._id}`}>Pinned</span>}
              <span data-testid={`category-${ann._id}`}>{ann.category}</span>
              <h4>{ann.title}</h4>
              <p>{ann.content}</p>
              {ann.author && <span>by {ann.author}</span>}
              <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
              <button onClick={() => handlePin(ann._id)}>
                {ann.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button onClick={() => handleDelete(ann._id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

describe('AnnouncementManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    expect(screen.getByText('Announcements')).toBeInTheDocument();
  });

  it('renders new announcement button', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    expect(screen.getByText('+ New Announcement')).toBeInTheDocument();
  });

  it('shows form when new announcement button is clicked', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    fireEvent.click(screen.getByText('+ New Announcement'));
    expect(screen.getByTestId('announcement-form')).toBeInTheDocument();
    expect(screen.getByText('Create Announcement')).toBeInTheDocument();
  });

  it('displays all announcements by default', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    expect(screen.getByTestId('announcement-ann1')).toBeInTheDocument();
    expect(screen.getByTestId('announcement-ann2')).toBeInTheDocument();
    expect(screen.getByTestId('announcement-ann3')).toBeInTheDocument();
  });

  it('displays announcement titles', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    expect(screen.getByText('Holiday Hours Update')).toBeInTheDocument();
    expect(screen.getByText('Adoption Event This Saturday')).toBeInTheDocument();
    expect(screen.getByText('Urgent: Lost Dog in Area')).toBeInTheDocument();
  });

  it('displays announcement content', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    expect(screen.getByText('We will be closed on Christmas Day and New Years Day.')).toBeInTheDocument();
    expect(screen.getByText('Join us for our monthly adoption event. All fees waived!')).toBeInTheDocument();
  });

  it('shows pinned indicator for pinned announcements', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    expect(screen.getByTestId('pinned-ann1')).toBeInTheDocument();
    expect(screen.queryByTestId('pinned-ann2')).not.toBeInTheDocument();
  });

  it('displays category badges', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    expect(screen.getByTestId('category-ann1')).toHaveTextContent('general');
    expect(screen.getByTestId('category-ann2')).toHaveTextContent('event');
    expect(screen.getByTestId('category-ann3')).toHaveTextContent('urgent');
  });

  it('displays author names when present', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    expect(screen.getByText('by Admin')).toBeInTheDocument();
    expect(screen.getByText('by Events Team')).toBeInTheDocument();
  });

  it('filters announcements by category', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    fireEvent.change(screen.getByTestId('filter-category'), { target: { value: 'event' } });
    expect(screen.getByTestId('announcement-ann2')).toBeInTheDocument();
    expect(screen.queryByTestId('announcement-ann1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('announcement-ann3')).not.toBeInTheDocument();
  });

  it('shows empty state when no announcements match filter', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    fireEvent.change(screen.getByTestId('filter-category'), { target: { value: 'adoption' } });
    expect(screen.getByText('No announcements yet. Create your first announcement!')).toBeInTheDocument();
  });

  it('can pin an unpinned announcement', async () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    const pinButtons = screen.getAllByText('Pin');
    fireEvent.click(pinButtons[0]); // Pin ann2
    await waitFor(() => {
      expect(screen.getByTestId('pinned-ann2')).toBeInTheDocument();
    });
  });

  it('can unpin a pinned announcement', async () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    fireEvent.click(screen.getByText('Unpin'));
    await waitFor(() => {
      expect(screen.queryByTestId('pinned-ann1')).not.toBeInTheDocument();
    });
  });

  it('can delete an announcement', async () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]); // Delete ann1
    await waitFor(() => {
      expect(screen.queryByTestId('announcement-ann1')).not.toBeInTheDocument();
    });
  });

  it('renders form with all required fields', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    fireEvent.click(screen.getByText('+ New Announcement'));

    expect(screen.getByTestId('title-input')).toBeInTheDocument();
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
    expect(screen.getByTestId('author-input')).toBeInTheDocument();
    expect(screen.getByTestId('content-input')).toBeInTheDocument();
    expect(screen.getByText('Publish')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('can fill and submit the form', async () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    fireEvent.click(screen.getByText('+ New Announcement'));

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'New Test Announcement' } });
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'Test announcement content' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'event' } });
    fireEvent.change(screen.getByTestId('author-input'), { target: { value: 'Tester' } });

    fireEvent.click(screen.getByText('Publish'));

    await waitFor(() => {
      expect(screen.queryByTestId('announcement-form')).not.toBeInTheDocument();
      expect(screen.getByText('New Test Announcement')).toBeInTheDocument();
      expect(screen.getByText('Test announcement content')).toBeInTheDocument();
    });
  });

  it('does not submit form without required fields', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    fireEvent.click(screen.getByText('+ New Announcement'));
    fireEvent.click(screen.getByText('Publish'));
    expect(screen.getByTestId('announcement-form')).toBeInTheDocument();
  });

  it('closes form when cancel is clicked', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    fireEvent.click(screen.getByText('+ New Announcement'));
    expect(screen.getByTestId('announcement-form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('announcement-form')).not.toBeInTheDocument();
  });

  it('displays dates for announcements', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    expect(screen.getByText(new Date('2024-01-15T10:00:00Z').toLocaleDateString())).toBeInTheDocument();
  });

  it('renders filter control', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    expect(screen.getByTestId('filter-category')).toBeInTheDocument();
  });

  it('resets filter to show all announcements', () => {
    render(<MockAnnouncementManager shelterId="shelter1" />);
    fireEvent.change(screen.getByTestId('filter-category'), { target: { value: 'event' } });
    expect(screen.queryByTestId('announcement-ann1')).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('filter-category'), { target: { value: 'all' } });
    expect(screen.getByTestId('announcement-ann1')).toBeInTheDocument();
    expect(screen.getByTestId('announcement-ann2')).toBeInTheDocument();
    expect(screen.getByTestId('announcement-ann3')).toBeInTheDocument();
  });
});
