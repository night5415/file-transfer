        public ClaimsPaidClaims GetPaidClaim(int claimId)
        {
            return WithCrReadConnection(db =>
            {
                //ClaimsClaimPayment  = BE_Claims_ClaimPayment
                //ClaimsPaidClaims    = BE_Claims_PaidClaims
                //ClaimsPaidClaimLine = BE_Claims_PaidClaimLines
               var claimPayment = db.Single<ClaimPaymentDTO>(db.From<ClaimsPaidClaims>()
                    .Join<ClaimsClaimPayment>((ce, ccp) => ce.PaymentId == ccp.ID)
                    .Where(pc => pc.ClaimId == claimId)
                    .OrderByDescending(x => x.ReceivedDate)
                    .Select<ClaimsPaidClaims, ClaimsClaimPayment>((cpc, ccp) => new
                    {
                        PaymentId = ccp.ID,
                        ccp.PaymentAmount,
                        PaidClaimID = cpc.Id,
                        cpc.ClaimAmount
                    }));

                //ClaimsPaidClaimAdjPayments = BE_Claims_PaidClaimAdjPayments
                //ClaimsClaimLevelAdjustment = BE_Claims_ClaimLevelAdjustments
                var claimAdjustments = db.Select(db.From<ClaimsClaimLevelAdjustment>()
                    .Where(cpcl => cpcl.PaidClaimID == claimPayment.PaidClaimID));

                //BeClaimsEntryItem             = BE_Claims_EntryItem
                //ClaimsPaidClaimLine           = BE_Claims_PaidClaimLines
                //ClaimsPaidClaimLineAdjustment = BE_Claims_PaidClaimLineAdj
                var servicelineAdjustments = db.Select<ServiceLineAdjustmentDTO>(db.From<ClaimsPaidClaimLineAdjustment>()
                    .Join<ClaimsPaidClaimLine>((pcla, pcl) => pcl.ID == pcla.LineID)
                    .Where<ClaimsPaidClaimLine>((pcl) => pcl.PaidClaimId == claimPayment.PaidClaimID)
                    .Select<ClaimsPaidClaimLineAdjustment, ClaimsPaidClaimLine>((pcla, pcl) => new
                    {
                        pcla.ID,
                        pcla.AdjustmentGroup,
                        pcla.AdjustmentReason,
                        pcla.AdjustmentAmount
                    }));

                return new ClaimsPaidClaims();
            });
        }