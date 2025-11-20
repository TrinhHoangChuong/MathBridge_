package com.mathbridge.dto.PortalStudentDTO;

import java.util.List;

public class StudentAssignmentSubmissionDTO {
    private String submissionId;
    private List<StudentAnswerDTO> answers;

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }

    public List<StudentAnswerDTO> getAnswers() {
        return answers;
    }

    public void setAnswers(List<StudentAnswerDTO> answers) {
        this.answers = answers;
    }

    public static class StudentAnswerDTO {
        private String questionId;
        private String answer;
        private List<String> answers;
        private String answerText;

        public String getQuestionId() {
            return questionId;
        }

        public void setQuestionId(String questionId) {
            this.questionId = questionId;
        }

        public String getAnswer() {
            return answer;
        }

        public void setAnswer(String answer) {
            this.answer = answer;
        }

        public List<String> getAnswers() {
            return answers;
        }

        public void setAnswers(List<String> answers) {
            this.answers = answers;
        }

        public String getAnswerText() {
            return answerText;
        }

        public void setAnswerText(String answerText) {
            this.answerText = answerText;
        }
    }
}

