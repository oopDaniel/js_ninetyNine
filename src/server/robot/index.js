// import EvilRobot from './evilRobot'
// import SmartRobot from './smartRobot'
import Robot from './Robot'

export const getRobot = (id) => {
  return new Robot(id)
  // const index = Math.random()
  // if (index < 0.3) return new Robot(id)
  // else if (index > 0.6) return new EvilRobot(id)
  // return new SmartRobot(id)
}

export const getRobots = (total) => {
}
