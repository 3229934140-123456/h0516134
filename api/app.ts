import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import userRoutes from './routes/users'
import thanksCardRoutes from './routes/thanksCards'
import recognitionRoutes from './routes/recognitions'
import monthlyStarRoutes from './routes/monthlyStars'
import notificationRoutes from './routes/notifications'
import hrRoutes from './routes/hr'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/users', userRoutes)
app.use('/api/thanks-cards', thanksCardRoutes)
app.use('/api/recognitions', recognitionRoutes)
app.use('/api/monthly-stars', monthlyStarRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/hr', hrRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', error)
  res.status(500).json({
    success: false,
    error: error.message || 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
