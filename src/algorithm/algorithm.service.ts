import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';

@Injectable()
export class AlgorithmService {
  /**
   * Hacker News Raking Algorithm
   * Score = (P - 1) / (T + 2)^G
   *
   * @param points - total likes + views...
   * @param createdAt - photo creation date
   */
  calculateScore(points: number, createdAt: Date) {
    const gravity = 0.8;
    const hours = dayjs().diff(createdAt, 'hours', true);

    return points / Math.pow(hours + 2, gravity);
  }
}
