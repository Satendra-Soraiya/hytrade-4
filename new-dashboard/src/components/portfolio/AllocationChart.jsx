import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatInr } from '../../utils/currency';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {item.name}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        {formatInr(item.value)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {item.percent?.toFixed(1)}% of portfolio
      </Typography>
    </Paper>
  );
}

function ChartLegend({ payload }) {
  if (!payload?.length) return null;
  return (
    <Box
      component="ul"
      sx={{
        listStyle: 'none',
        p: 0,
        m: 0,
        mt: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 0.75,
      }}
    >
      {payload.map((entry) => (
        <Box
          component="li"
          key={entry.value}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: entry.color,
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" color="text.secondary" noWrap title={entry.value}>
            {entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function AllocationChart({ data, height = 300 }) {
  const theme = useTheme();

  if (!data?.length) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No holdings to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            stroke={theme.palette.background.paper}
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend content={<ChartLegend />} verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
