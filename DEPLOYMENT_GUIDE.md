# EduPilot AI - Deployment & Operations Guide

## Pre-Deployment Checklist

Before deploying EduPilot AI to production, ensure:

### Configuration
- [ ] All environment variables are set correctly
- [ ] Database connection is tested and working
- [ ] LLM API keys are valid and have sufficient quota
- [ ] Image generation API is accessible
- [ ] Speech-to-text API is configured
- [ ] S3/storage credentials are set

### Testing
- [ ] All 8 modules tested with sample inputs
- [ ] Quiz scoring verified with multiple questions
- [ ] Translation tested in all language pairs
- [ ] Image generation produces expected results
- [ ] Database queries return correct data
- [ ] Error handling works for API failures
- [ ] Mobile responsiveness verified

### Security
- [ ] OAuth configuration verified
- [ ] Session cookies configured securely
- [ ] Input validation enabled
- [ ] CORS settings appropriate
- [ ] Rate limiting considered for LLM calls
- [ ] Sensitive data not logged

### Performance
- [ ] LLM response times acceptable
- [ ] Database queries optimized
- [ ] Frontend bundle size reasonable
- [ ] Images optimized for web
- [ ] Caching strategy implemented

## Deployment Steps

### 1. Create Final Checkpoint

In the Management UI:
1. Click "Version history" (⋯ menu)
2. Review all changes
3. Click "Create checkpoint" if satisfied

### 2. Deploy to Production

In the Management UI:
1. Click "Publish" button (top-right)
2. Select "Autoscale" hosting (default)
3. Review deployment settings
4. Click "Deploy"
5. Wait for deployment to complete (2-5 minutes)

### 3. Configure Custom Domain

In Management UI → Settings → Domains:
1. Click "Add Domain"
2. Enter your domain (e.g., edupilot.example.com)
3. Follow DNS configuration steps
4. Verify domain ownership
5. SSL certificate auto-provisioned

### 4. Post-Deployment Verification

1. **Access Application**
   - Visit your deployed URL
   - Verify all pages load
   - Check console for errors

2. **Test Core Features**
   - Generate concept explanation
   - Create and submit quiz
   - Test translation
   - Generate lesson plan
   - Create whiteboard content

3. **Monitor Performance**
   - Check page load times
   - Monitor LLM API latency
   - Review database query times
   - Check error logs

4. **Verify Security**
   - Test authentication flow
   - Verify HTTPS working
   - Check CORS headers
   - Test role-based access

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=mysql://user:pass@host:3306/edupilot

# Authentication
JWT_SECRET=your-secret-key-here
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# LLM API
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# Application
VITE_APP_TITLE=EduPilot AI
VITE_APP_LOGO=https://your-logo-url.png
```

### Setting Variables

In Management UI → Settings → Secrets:
1. Click "Add Secret"
2. Enter variable name and value
3. Click "Save"
4. Restart server for changes to take effect

## Monitoring

### Dashboard Analytics

In Management UI → Dashboard:
- **UV (Unique Visitors)**: Daily active users
- **PV (Page Views)**: Total page views
- **Module Usage**: Which modules are most used
- **Error Rate**: API and frontend errors
- **Performance**: Page load times

### Log Files

Access logs via Management UI → Code → `.manus-logs/`:

- **devserver.log** - Server startup, middleware errors
- **browserConsole.log** - Frontend JavaScript errors
- **networkRequests.log** - API calls, response times
- **sessionReplay.log** - User interactions

### Database Monitoring

In Management UI → Database:
- View all tables
- Check data volume
- Monitor query performance
- Review recent records

## Scaling Considerations

### Autoscale (Current)
- Automatically scales 0-N instances
- Suitable for variable traffic
- Cold starts possible (2-5 seconds)
- No minimum cost

### Reserved Hosting (For High Traffic)
- Always-on instances
- Predictable performance
- Higher cost
- Better for >1000 concurrent users

To upgrade:
1. Contact Manus support
2. Provide traffic estimates
3. Configure reserved instances
4. Migrate database if needed

## Backup & Recovery

### Database Backups

Manus automatically backs up your database:
- **Daily backups** - Retained for 7 days
- **Weekly backups** - Retained for 4 weeks
- **Monthly backups** - Retained for 12 months

To restore:
1. Contact Manus support
2. Specify restore point
3. Provide backup date/time
4. Confirm restore operation

### Code Backups

All code versions are saved:
1. Click "Version history" (⋯ menu)
2. View all checkpoints
3. Click "Rollback" to restore previous version

## Maintenance Tasks

### Weekly
- [ ] Check error logs for patterns
- [ ] Monitor API quota usage
- [ ] Review user feedback
- [ ] Test core workflows

### Monthly
- [ ] Review analytics trends
- [ ] Check database size
- [ ] Update dependencies (if needed)
- [ ] Performance optimization review

### Quarterly
- [ ] Security audit
- [ ] Backup verification
- [ ] Disaster recovery drill
- [ ] Capacity planning

## Troubleshooting Production Issues

### High Latency

**Symptoms**: Slow page loads, delayed responses

**Diagnosis**:
1. Check `.manus-logs/networkRequests.log` for slow API calls
2. Review LLM API response times
3. Check database query times
4. Monitor server CPU/memory

**Solutions**:
- Optimize LLM prompts (fewer tokens)
- Add database indexes
- Implement response caching
- Upgrade to Reserved hosting

### API Errors

**Symptoms**: 500 errors, failed requests

**Diagnosis**:
1. Check `.manus-logs/devserver.log` for errors
2. Verify API credentials
3. Check API quota limits
4. Review error stack traces

**Solutions**:
- Restart server
- Verify environment variables
- Check API status page
- Contact API provider

### Database Issues

**Symptoms**: Connection timeouts, query failures

**Diagnosis**:
1. Verify DATABASE_URL
2. Check database is running
3. Review query logs
4. Check connection pool

**Solutions**:
- Restart database connection
- Optimize slow queries
- Increase connection pool size
- Contact database provider

### Authentication Issues

**Symptoms**: Login failures, session errors

**Diagnosis**:
1. Check OAuth configuration
2. Verify JWT_SECRET
3. Review session cookies
4. Check browser console

**Solutions**:
- Clear browser cookies
- Verify OAuth credentials
- Restart authentication service
- Check CORS settings

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - Lazy load module pages
   - Split large components
   - Use React.lazy()

2. **Image Optimization**
   - Use responsive images
   - Compress before upload
   - Use WebP format
   - Implement lazy loading

3. **Caching**
   - Cache API responses
   - Use service workers
   - Set appropriate cache headers

### Backend Optimization

1. **Database**
   - Add indexes on frequently queried columns
   - Use pagination for large queries
   - Archive old records
   - Monitor slow queries

2. **LLM Calls**
   - Cache common prompts
   - Reuse responses when possible
   - Optimize token usage
   - Monitor API costs

3. **API Response**
   - Compress responses with gzip
   - Return only needed fields
   - Implement pagination
   - Use streaming for large responses

## Cost Optimization

### LLM API Costs
- Monitor token usage
- Optimize prompts (fewer tokens)
- Cache responses
- Batch similar requests
- Consider model selection

### Database Costs
- Archive old data
- Optimize queries
- Monitor storage growth
- Use appropriate indexes

### Hosting Costs
- Use Autoscale for variable traffic
- Monitor instance usage
- Optimize cold start time
- Consider Reserved for consistent traffic

## Security Hardening

### Application Security
1. Enable HTTPS (automatic)
2. Set security headers
3. Implement rate limiting
4. Add CSRF protection
5. Validate all inputs

### Data Security
1. Encrypt sensitive data
2. Use parameterized queries
3. Implement access controls
4. Audit data access
5. Regular security updates

### Infrastructure Security
1. Use strong passwords
2. Enable 2FA for accounts
3. Regular backups
4. Disaster recovery plan
5. Security monitoring

## Incident Response

### Outage Response

1. **Immediate (0-5 min)**
   - Check status page
   - Verify service health
   - Check error logs
   - Notify team

2. **Investigation (5-30 min)**
   - Identify root cause
   - Check recent changes
   - Review error patterns
   - Gather diagnostics

3. **Resolution (30+ min)**
   - Apply fix
   - Test thoroughly
   - Deploy to production
   - Monitor closely

4. **Post-Incident (24 hours)**
   - Document incident
   - Identify improvements
   - Update runbooks
   - Share learnings

### Rollback Procedure

If deployment causes issues:

1. Go to Management UI → Version history
2. Find last stable checkpoint
3. Click "Rollback"
4. Confirm rollback
5. Monitor for issues
6. Investigate root cause

## Support & Resources

### Documentation
- README_EDUPILOT.md - Feature overview
- IMPLEMENTATION_GUIDE.md - Technical details
- references/ - Integration guides

### Support Channels
- Manus Help: https://help.manus.im
- Documentation: https://docs.manus.im
- Community: https://community.manus.im

### Emergency Contacts
- Critical Issues: support@manus.im
- Security Issues: security@manus.im
- Billing Issues: billing@manus.im

---

**Last Updated**: June 2026
**Version**: 1.0.0
