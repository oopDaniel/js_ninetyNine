import EvilRobot from './evilRobot'
import SmartRobot from './smartRobot'
import Robot from './Robot'

export const getRobot = (hands) => {
  const index = Math.random()
  if (index < 0.3) return new Robot(hands)
  else if (index > 0.6) return new EvilRobot(hands)
  return new SmartRobot(hands)
}

export const getRobots = (total) => {
}
