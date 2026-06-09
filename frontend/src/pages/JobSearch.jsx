import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, ExternalLink, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function JobSearch() {
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobsList, setJobsList] = useState([]);
  const [searchedRole, setSearchedRole] = useState('');

  // States for automated recommendations
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendedRole, setRecommendedRole] = useState('');
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [errorRecs, setErrorRecs] = useState('');
  const [hasHistory, setHasHistory] = useState(false);

  // Fetch recommended jobs based on latest report
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      setErrorRecs('');
      try {
        const data = await api.get('/api/interview/history');
        const reports = data.reports || [];
        if (reports.length > 0) {
          setHasHistory(true);
          const latestReport = reports[0];
          const role = latestReport.title || 'Software Engineer';
          setRecommendedRole(role);
          
          try {
            const jobData = await api.post('/api/jobs/search', { jobRole: role });
            setRecommendedJobs(jobData.response?.jobs || []);
          } catch (jobErr) {
            console.error('Failed to fetch recommended jobs:', jobErr);
            setErrorRecs('Failed to load recommended job openings automatically.');
          }
        } else {
          setHasHistory(false);
        }
      } catch (err) {
        console.error('Failed to load history in JobSearch:', err);
        setErrorRecs('Could not check history for recommendations.');
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) return;

    setLoading(true);
    setError('');
    setJobsList([]);
    setSearchedRole(jobRole);

    try {
      // Endpoint is POST /api/jobs/search
      const data = await api.post('/api/jobs/search', { jobRole });
      setJobsList(data.response?.jobs || []);
    } catch (err) {
      console.error('Job search failed:', err);
      setError(err.message || 'Agentic search failed. The scraper or model might be overloaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformBadgeClass = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'linkedin':
        return 'badge-linkedin';
      case 'shine':
        return 'badge-shine';
      default:
        return 'badge-other';
    }
  };

  return (
    <div className="job-search-page animate-fade-in">
      <div className="page-header">
        <h1>Agentic Job Finder</h1>
        <p className="subtitle">Our AI Agent crawls live openings on LinkedIn and Shine.com directly matching your target role</p>
      </div>

      <div className="search-bar-card card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Enter job role (e.g. Node.js Developer, React Engineer, Product Manager)..."
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary search-submit-btn" disabled={loading || !jobRole.trim()}>
            {loading ? (
              <>
                <RefreshCw className="spinner" size={18} />
                Searching...
              </>
            ) : (
              'Find Live Openings'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="auth-error-alert search-alert-spacing">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-card card">
          <div className="loading-content">
            <div className="pulse-sparkle">
              <Sparkles size={36} className="sparkle-icon spinner" />
            </div>
            <h2>AI Agent is Searching Opportunities...</h2>
            <p className="job-agent-searching-hint">
              Querying live index. Web-scraping public channels on LinkedIn and Unstop matching "{searchedRole}".
            </p>
            <div className="search-status-bar">
              <div className="status-progress-track">
                <div className="status-progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      ) : jobsList.length > 0 ? (
        <div className="results-container animate-fade-in search-results-box">
          <div className="results-info-row">
            <h3>Search Results for "{searchedRole}"</h3>
            <span className="results-count-badge">{jobsList.length} opportunities</span>
          </div>

          <div className="jobs-grid">
            {jobsList.map((job, index) => (
              <div key={index} className="job-card card stagger-item">
                <div className="job-card-header">
                  <span className={`platform-badge ${getPlatformBadgeClass(job.platform)}`}>
                    {job.platform}
                  </span>
                </div>

                <div className="job-card-body">
                  <h4 className="job-title">{job.title}</h4>
                  <div className="job-company-row">
                    <Briefcase size={16} />
                    <span>{job.company}</span>
                  </div>
                  <div className="job-location-row">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="job-card-footer">
                  <a 
                    href={job.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary apply-link-btn"
                  >
                    <span>Apply on {job.platform}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchedRole ? (
        <div className="empty-state-card card animate-fade-in search-results-box">
          <Briefcase size={48} className="empty-icon" />
          <h4>No live listings found</h4>
          <p>The agent could not find active roles matching "{searchedRole}" right now. Try adjusting your search keywords (e.g. "Software Engineer" instead of a highly specific stack).</p>
        </div>
      ) : null}

      {/* Automatic Recommendations Section */}
      <div className="recommendations-container-wrapper animate-fade-in">
        <div className="section-divider"></div>
        
        <div className="results-info-row">
          <h3>Personalized Matches</h3>
          <span className="recs-pill">Auto-Matched</span>
        </div>

        {loadingRecs ? (
          <div className="loading-card card">
            <div className="loading-content">
              <RefreshCw className="spinner primary-color-spinner" size={32} />
              <p>Analyzing history and pulling matched jobs...</p>
            </div>
          </div>
        ) : errorRecs ? (
          <div className="auth-error-alert">
            <AlertCircle size={18} />
            <span>{errorRecs}</span>
          </div>
        ) : !hasHistory ? (
          <div className="empty-state-card card animate-fade-in recommendation-tip-card">
            <Sparkles size={36} className="empty-icon recs-sparkle-icon" />
            <h4>Get Automated Recommendations</h4>
            <p>Upload and analyze your resume first to automatically get active job recommendations matching your profile role.</p>
            <Link to="/upload" className="btn-primary recs-upload-btn">
              Analyze Resume
            </Link>
          </div>
        ) : recommendedJobs.length > 0 ? (
          <div className="results-container animate-fade-in">
            <div className="recs-subtitle-row">
              <p>Found <strong>{recommendedJobs.length}</strong> job openings matching your analyzed resume profile for <strong>"{recommendedRole}"</strong></p>
            </div>

            <div className="jobs-grid">
              {recommendedJobs.map((job, index) => (
                <div key={index} className="job-card card stagger-item recommended-job-card">
                  <div className="job-card-header">
                    <span className={`platform-badge ${getPlatformBadgeClass(job.platform)}`}>
                      {job.platform}
                    </span>
                    <span className="badge-recommended">Match</span>
                  </div>

                  <div className="job-card-body">
                    <h4 className="job-title">{job.title}</h4>
                    <div className="job-company-row">
                      <Briefcase size={16} />
                      <span>{job.company}</span>
                    </div>
                    <div className="job-location-row">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                  </div>

                  <div className="job-card-footer">
                    <a 
                      href={job.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-primary apply-link-btn"
                    >
                      <span>Apply on {job.platform}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state-card card animate-fade-in">
            <Briefcase size={48} className="empty-icon" />
            <h4>No matches found for "{recommendedRole}"</h4>
            <p>Our search agent couldn't find live postings matching your resume role at this moment. You can search manually above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
