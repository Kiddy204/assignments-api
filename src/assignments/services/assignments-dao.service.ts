import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Assignment } from '../assignment.model';
import { LoggerService } from 'src/shared/services/logger/logger.service';
import { Types } from 'mongoose';

@Injectable()
export class AssignmentsDaoService {
    private ITEM_PER_PAGE = 10;

    constructor(
        @InjectModel(Assignment)
        private readonly assignmentModel: ReturnModelType<typeof Assignment>,
        private logger: LoggerService,
    ){}

    createAssignment = async (
        title: string,
        description: string,
        deadline: Date,
      ): Promise<Assignment> => {
        try {
          const assignment = new Assignment()
          assignment.title = title
          assignment.description = description
          assignment.deadline = deadline
          return await new this.assignmentModel(assignment).save()
        } catch (e) {
          this.logger.error(
            `Exception creating Assignment${title}, ${e.message}`,
          );
          throw e;
        }
      };
  updateAssignment = async (assignment: Assignment): Promise<Assignment> => {
    try {
      return await this.assignmentModel.findOneAndUpdate(
        { _id: assignment._id },
        assignment,
        { new: true },
      );
    } catch (e) {
      this.logger.error(
        `Exception updating assignment ${assignment._id} . ${e}`,
      );
      throw e;
    }
  };
  findAssignmentById = async (_id: Types.ObjectId): Promise<Assignment> => {
    try {
      return await this.assignmentModel.findOne({ _id }).exec();
    } catch (e) {
      this.logger.error(`Exception finding assignment ${_id}. ${e}`);
      throw e;
    }
  };
  getAssignments = async (
    page: number,
    itemsPerPage: number = this.ITEM_PER_PAGE,
    params?: any,
    sort = 'asc',
    sortBy = 'lastName',
  ): Promise<Assignment[]> => {
    try {
      if (sort === 'asc') {
        return await this.assignmentModel
          .find({ ...params })
          .skip(itemsPerPage * page - itemsPerPage)
          .sort({ [sortBy]: 1 })
          .limit(itemsPerPage)
          .exec();
      }
      return await this.assignmentModel
        .find({ ...params })
        .skip(itemsPerPage * page - itemsPerPage)
        .sort({ [sortBy]: -1 })
        .limit(itemsPerPage)
        .exec();
    } catch (e) {
      this.logger.error(`Exception getting assignments. ${e}`);
      throw e;
    }
  };

  deleteAssignments = async (): Promise<boolean> => {
    try {
      return await this.assignmentModel
        .deleteMany({}, err => {
          return err;
        })
        .then(err => {
          if (err) {
            return false;
          }
          return true;
        });
    } catch (e) {
      this.logger.error(`Exception deleting assignments. ${e}`);
      throw e;
    }
  };

  deleteAssignmentById = async (_id: Types.ObjectId): Promise<boolean> => {
    try {
      return await this.assignmentModel
        .deleteOne({ _id }, err => {
          return err;
        })
        .then(err => {
          if (err) {
            return false;
          }
          return true;
        });
    } catch (e) {
      this.logger.error(`Exception deleting assignment with id ${_id}. ${e}`);
      throw e;
    }
  };
   

}
