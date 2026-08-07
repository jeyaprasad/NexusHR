package com.zidio.insiihr.config;

import com.zidio.insiihr.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;

    @Pointcut("within(com.zidio.insiihr.service.*)")
    public void serviceMethods() {}

    @AfterReturning(pointcut = "execution(* com.zidio.insiihr.service.EmployeeService.createEmployee(..))", returning = "result")
    public void auditCreateEmployee(Object result) {
        audit("CREATE", "Employee", result);
    }

    @AfterReturning(pointcut = "execution(* com.zidio.insiihr.service.EmployeeService.updateEmployee(..))", returning = "result")
    public void auditUpdateEmployee(Object result) {
        audit("UPDATE", "Employee", result);
    }

    @AfterReturning("execution(* com.zidio.insiihr.service.EmployeeService.deleteEmployee(..)) && args(id)")
    public void auditDeleteEmployee(Long id) {
        audit("DELETE", "Employee", id);
    }

    @AfterReturning(pointcut = "execution(* com.zidio.insiihr.service.LeaveService.applyLeave(..))", returning = "result")
    public void auditCreateLeave(Object result) {
        audit("CREATE", "Leave", result);
    }

    @AfterReturning(pointcut = "execution(* com.zidio.insiihr.service.LeaveService.updateLeaveStatus(..))", returning = "result")
    public void auditUpdateLeave(Object result) {
        audit("UPDATE", "Leave", result);
    }

    @AfterReturning(pointcut = "execution(* com.zidio.insiihr.service.PayrollService.createPayroll(..))", returning = "result")
    public void auditCreatePayroll(Object result) {
        audit("CREATE", "Payroll", result);
    }

    private void audit(String action, String entityType, Object result) {
        String performedBy = getCurrentUser();
        Long entityId = extractId(result);
        auditService.logSimple(action, entityType, entityId, performedBy);
    }

    private String getCurrentUser() {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "SYSTEM";
    }

    private Long extractId(Object obj) {
        if (obj == null) return null;
        try {
            var method = obj.getClass().getMethod("getId");
            return (Long) method.invoke(obj);
        } catch (Exception ignored) {
            if (obj instanceof Long id) return id;
        }
        return null;
    }
}
