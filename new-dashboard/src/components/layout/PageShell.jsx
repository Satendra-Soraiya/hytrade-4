import { Box, Typography, Stack } from '@mui/material';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

export function PageShell({ children }) {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {children}
    </Box>
  );
}

/** Full-width page root — use on every routed page */
export function PageContent({ children, sx }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function Panel({ title, subtitle, action, children, noPadding = false, fill = false }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        overflow: noPadding ? 'hidden' : 'visible',
        width: '100%',
        minWidth: 0,
        ...(fill && {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }),
      }}
    >
      {(title || action) && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 52,
          }}
        >
          <Box>
            {title && <Typography variant="subtitle1">{title}</Typography>}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
      )}
      <Box
        sx={{
          p: noPadding ? 0 : 2,
          ...(fill && { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function StatCard({ label, value, hint, tone }) {
  const color = tone === 'up' ? 'success.main' : tone === 'down' ? 'error.main' : 'text.primary';
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        height: '100%',
      }}
    >
      <Typography variant="overline" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ mt: 0.75, color, fontWeight: 600, wordBreak: 'break-word' }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}
